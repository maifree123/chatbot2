import { createIdGenerator,streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { Content } from 'next/font/google';
import { pc } from '@/lib/pinecone';
import { createDeepSeek, deepseek } from '@ai-sdk/deepseek';
import { appendResponseMessages } from 'ai'; // 新增导入
import { saveChat } from '@/db/index'; // 确保chat-store工具存在
import { createChat} from '@/db/index';
import { getUserPreferences, getAllFileHashesFromDatabase } from '@/db/index'
import { experimental_createMCPClient } from 'ai';
import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio';
import { ToolSet, Tool } from 'ai'; // 从 ai 包中导入类型

interface PineconeMatch {
  id: string;
  score?: number;
  metadata?: {
    text?: string | number | boolean; // 明确可能的数据类型
  };
}

const openai = createOpenAI({
  // custom settings, e.g.
  compatibility: 'strict', // strict mode, enable when using the OpenAI API
  apiKey: process.env.OPENAI_API_KEY, // 从环境变量中读取 API Key
  baseURL: 'https://chatapi.nloli.xyz/v1', // 可选：自定义 API 地址
});
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
/*
export async function POST(req: Request) {
  
  const { messages } = await req.json();

    //在给gpt前读取content
    const lastMessage = messages[messages.length - 1]

    const content = await getContent(lastMessage.content)


  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: 'You are a helpful assistant, here is the context: ' + content,
    messages,
  });

  return result.toDataStreamResponse();
}
*/

export async function POST(req: Request) {
  // 仅从请求头获取用户ID
  const userId = Number(req.headers.get('X-User-ID')); // 直接转换为数字
  
  
  
  let { messages, id, model, isNewChat, customSettings ,pdfContent = '', enableWebSearch = false, enableRAG = true, enableMCP= true} = await req.json();
  
  // 创建新聊天记录
  if (isNewChat && messages.length === 1) {
    id = await createChat(userId); // 直接使用转换后的数字
  }
  const lastMessage = messages[messages.length - 1];
  //用户偏好
  if (!customSettings) {
    customSettings = await getUserPreferences(userId);
    if (!customSettings) {
      // 如果没有偏好设置，提供默认值
      customSettings = {
        preferredName: '用户',
        traits: ['标准模式'],
        preferences: '无',
      };
    }
  }
  // RAG模块
  let content = '';

  if (enableRAG) {
    content = await getContent(lastMessage.content);
    console.log('enableRAG:', enableRAG);  // 检查状态是否更新
  }
  // 联网模块
  let webContent = '';
  if (enableWebSearch) {
    webContent = await getWebContent(lastMessage.content);
  }

  async function getWebContent(query: string): Promise<string> {
    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: query,
          gl: 'cn',
          hl: 'zh-cn'
        })
      });
  
      const data = await response.json();
      return data.organic?.slice(0, 3).map((result: any) => 
        `[网络结果] ${result.title}\n${result.snippet}`
      ).join('\n\n') || '未找到相关网络信息';
    } catch (error) {
      console.error('联网搜索失败:', error);
      return '[网络连接失败]';
    }
  }

  
  // 构建系统提示（包含PDF内容）
  const systemMessage = `
    如果需要用到工具，必须使用fetch_markdown。
    ### 用户自定义设置
    称呼方式: ${customSettings?.preferredName || '用户'}
    交互特征: ${customSettings?.traits?.join(', ') || '标准模式'}
    特别偏好: ${customSettings?.preferences || '无'}

    ### 实时网络信息
    ${webContent || "【未启用联网搜索】"}
    ### 附加文档内容
    ${pdfContent || "无附加文档"}

    ### RAG上下文相关记忆
    ${content}

   
  `;
    console.log(systemMessage);

    let mcpClient = null;
    let mcpTools: ToolSet = {};
    
    if (enableMCP) {
      mcpClient = await experimental_createMCPClient({
        transport: new StdioMCPTransport({
          command: 'node',
          args: ['mcpserver/fetch-mcp-main/dist/index.js'],
        }),
      });
    
      const toolsMap = await mcpClient.tools();
      // 直接把 toolsMap 的结构转换成正确的 ToolSet
      mcpTools = Object.fromEntries(
        Object.entries(toolsMap).map(([name, tool]) => [
          name,
          {
            description: tool.description,
            parameters: tool.parameters,
            execute: tool.execute,
          },
        ])
      );
      console.log('Loaded MCP tools:', mcpTools);
    }

    const getProvider = (model: string) => {
      if (model.startsWith('gpt-4o-mini')) return openai;
      if (model.startsWith('deepseek')) return deepseek;
      return deepseek; // 默认
    };
    
    const provider = getProvider(model);
    const result = streamText({
      model: provider(model),
      system: systemMessage,
      messages,
      tools: Object.values(mcpTools) as any,
      maxSteps: 2,  
      experimental_generateMessageId: createIdGenerator({ prefix: 'msgs', size: 16 }),
      abortSignal: req.signal,
      async onFinish({ response }) {
        const toolMsg = response.messages.find(msg => msg.role === 'tool');
        if (toolMsg) {
          console.log('工具调用返回内容：', JSON.stringify(toolMsg.content, null, 2));
        } else {
          console.log('没有任何 tool 消息被调用');
        }
      // 保存聊天记录（不存储pdfContent）
      await saveChat({
        id,
        userId,
        messages: appendResponseMessages({  
        messages,
        responseMessages: response.messages,
        }),
      });
      if (mcpClient) await mcpClient.close();
    },
  });

  // 添加 sendReasoning 参数
  return result.toDataStreamResponse({
    sendReasoning: true, // 确保发送推理令牌
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'x-chat-id': id, // 确保正确的 Content-Type
      'x-tools': JSON.stringify(mcpTools),
    }
  });
}


// 修改后的 getContent 函数
const getContent = async (content: string) => {
  console.time('Total query time');

  const model = 'multilingual-e5-large';
  console.log('Starting embedding generation for query:', content.substring(0, 50) + '...');

  const queryEmbedding = await pc.inference.embed(
    model,
    [content],
    { inputType: 'query' }
  );
  console.log('Embedding generated. Vector length:', queryEmbedding[0].values?.length);

  // 获取命名空间列表
  console.log('Fetching file hashes from database...');
  const fileHashes = await getAllFileHashesFromDatabase();
  console.log('Found', fileHashes.length, 'namespaces:', fileHashes);

  let allMatches: PineconeMatch[] = [];

  console.log('\nStarting parallel namespace queries:');
  await Promise.all(fileHashes.map(async (fileHash) => {
    const nsLogPrefix = `[NS:${fileHash.substring(0, 6)}]`;

    try {
      console.log(`${nsLogPrefix} Start querying...`);
      const namespace = pc.index("chatbot").namespace(fileHash);

      const startTime = Date.now();
      const queryResponse = await namespace.query({
        topK: 3,
        vector: queryEmbedding[0].values!,
        includeValues: false,
        includeMetadata: true
      });
      const duration = Date.now() - startTime;

      // 类型转换确保符合 PineconeMatch 接口
      const typedMatches = queryResponse.matches.map(match => ({
        id: match.id,
        score: match.score,
        metadata: {
          text: match.metadata?.text // 保留原始类型
        }
      } as PineconeMatch));

      console.log(`${nsLogPrefix} Query completed in ${duration}ms. Found ${typedMatches.length} matches.`);
      console.log(`${nsLogPrefix} Sample matches:`,
        typedMatches.slice(0, 2).map(m => ({
          id: m.id,
          score: m.score?.toFixed(3) ?? 'N/A', // 处理可能的 undefined
          text: typeof m.metadata?.text === 'string' 
            ? m.metadata.text.substring(0, 30) + '...'
            : '[non-string content]'
        }))
      );

      allMatches.push(...typedMatches);
    } catch (error) {
      console.error(`${nsLogPrefix} Query failed:`, error instanceof Error ? error.message : error);
    }
  }));

  // 排序时处理可能的 undefined score
  allMatches.sort((a, b) => {
    const scoreA = a.score ?? 0;
    const scoreB = b.score ?? 0;
    return scoreB - scoreA;
  });

  console.log('\nAfter global sorting:');
  console.log('Top 3 scores:', allMatches.slice(0, 3).map(m => m.score?.toFixed(3) ?? 'N/A'));

  // 去重处理
  const uniqueMatches = Array.from(
    new Map(allMatches.map(match => [match.id, match])).values()
  );

  console.log('\nAfter deduplication:');
  console.log('Sample unique matches:',
    Array.from(uniqueMatches).slice(0, 3).map(m => ({
      id: m.id,
      score: m.score?.toFixed(3) ?? 'N/A',
      text: typeof m.metadata?.text === 'string'
        ? m.metadata.text.substring(0, 30) + '...'
        : '[non-string content]'
    }))
  );

  const finalResults = Array.from(uniqueMatches).slice(0, 3);
  
  console.log('\nFinal results:',
    finalResults.map(m => {
      const score = m.score?.toFixed(3) ?? 'N/A';
      const text = typeof m.metadata?.text === 'string'
        ? m.metadata.text.substring(0, 50)
        : '[non-string content]';
      return `[${score}] ${text}...`;
    })
  );

  console.timeEnd('Total query time');

  return finalResults
    .map(m => {
      if (typeof m.metadata?.text === 'string') {
        return m.metadata.text;
      }
      return JSON.stringify(m.metadata?.text); // 处理非字符串内容
    })
    .join('\n\n');
};