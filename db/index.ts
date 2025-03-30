
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, sql, and} from 'drizzle-orm';
import { fileTable, chatTable } from './schema';
import { generateId } from 'ai'; // 确保已安装ai包
import { Message } from 'ai';
import { readFile } from 'fs/promises';
import { writeFile } from 'fs/promises';
import { deepseek } from '@ai-sdk/deepseek';
import { generateText } from 'ai';  
import { UserModal,userTable } from './schema'
import { userPreferencesTable } from '@/db/schema';

const db = drizzle(process.env.DATABASE_URL!);



export const getUserByUsername = async (username: string) => {
  try {
    const result = await db
      .select()
      .from(userTable)
      .where(eq(userTable.username, username))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('查询用户失败:', error);
    throw new Error('用户查询失败');
  }
};
export const getUserByUsername2 = async (userId: number) => {
  try {
    const result = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, userId)) // 使用 id 查找用户
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('查询用户失败:', error);
    throw new Error('用户查询失败');
  }
};


// 修改现有的loginUser方法使用新查询方法
export const loginUser = async (username: string, password: string) => {
  const user = await getUserByUsername(username);
  
  if (!user) {
    throw new Error("用户名不存在");
  }

  if (user.password !== password) {
    throw new Error("密码错误");
  }

  return user.id;
};

// 修改现有的registerUser方法使用新查询方法
export const registerUser = async (username: string, password: string) => {
  const existingUser = await getUserByUsername(username);
  
  if (existingUser) {
    throw new Error("用户名已存在");
  }

  const [newUser] = await db.insert(userTable).values({
    username,
    password
  }).returning();

  return newUser;
};

//找回
export const updateUserPassword = async (
  username: string,
  oldPassword: string,
  newPassword: string
) => {
  const user = await getUserByUsername(username);
  
  if (!user) {
    throw new Error("用户名不存在");
  }

  // 添加旧密码验证（假设明文存储）
  if (user.password !== oldPassword) {
    throw new Error("旧密码不正确");
  }

  // 更新密码
  await db.update(userTable)
    .set({ password: newPassword })
    .where(eq(userTable.id, user.id));
};

export const insertFile = async (file_name: string, file_key: string) => {
    await db.insert(fileTable).values({
        file_name,
        file_key
    })
};

// 根据文件ID删除记录
export const deleteFileById = async (fileId: number) => {
  await db
    .delete(fileTable)
    .where(eq(fileTable.id, fileId));
};

export const getFileKeyById = async (fileId: number) => {
  try {
    const result = await db
      .select({ file_key: fileTable.file_key })
      .from(fileTable)
      .where(eq(fileTable.id, fileId))
      .limit(1);

    if (result.length === 0) return null;
    console.log('file_key');
    return result[0].file_key;
  } catch (error) {
    console.error('Error fetching file key:', error);
    throw error;
  }
};


export const getAllFileHashesFromDatabase = async () => {
  try {
    // 查询 fileTable 表中所有的记录
    const result = await db.select().from(fileTable);

    // 提取所有的 file_key 并返回
    return result.map(item => item.file_key);
  } catch (error) {
    console.error('Error fetching file hashes:', error);
    throw error;  // 或者返回一个空数组 []
  }
};

//用户偏好
export const saveUserPreferences = async (
  userId: number,
  preferredName: string,
  traits: string[],
  preferences: string
) => {
  if (!preferredName?.trim()) throw new Error('偏好称呼不能为空');
  
  await db.insert(userPreferencesTable)
    .values({
      userId,
      preferredName: preferredName.trim(),
      traits: traits || [],
      preferences: preferences.trim()
    })
    .onConflictDoUpdate({
      target: userPreferencesTable.userId, // 需要唯一约束
      set: {
        preferredName: sql`EXCLUDED.preferred_name`,
        traits: sql`EXCLUDED.traits`,
        preferences: sql`EXCLUDED.preferences`
      }
    });
};
//GET用户偏好
export const getUserPreferences = async (userId: number) => {
  const result = await db
    .select()
    .from(userPreferencesTable)
    .where(eq(userPreferencesTable.userId, userId))
    .limit(1);
  return result[0] || null;
};

//删除用户
export const deleteUser = async (userId: number): Promise<void> => {
  await db.transaction(async (tx) => {
    // 删除用户主体并获取被删除的数据
    const deletedUsers = await tx.delete(userTable)
      .where(eq(userTable.id, userId))
      .returning(); // 明确要求返回被删除数据

    if (deletedUsers.length === 0) { // 通过数组长度判断
      throw new Error('用户不存在');
    }
  });
};

//获取公共文件

export const getFiles = async () => {
    return await db.select().from(fileTable)
}

// 新增AI生成标题函数
const generateAITitle = async (messages: Message[]) => {
  try {
    // 过滤出用户和助理消息
    const conversation = messages
      .filter(m => ['user', 'assistant'].includes(m.role))
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    // 调用 ai 库的 generateText 方法生成标题
    const { text } = await generateText({
      model: deepseek('deepseek-chat'),  // 你可以替换为实际的模型名称，例如 'gpt-3.5-turbo'
      prompt: `请用不超过8个中文单词总结以下对话的主题作为标题，不要使用标点：\n${conversation.slice(0, 2000)}`
    });

    // 提取并优化标题
    return text
      .replace(/["“”]/g, '')
      .split(/\s+/)
      .slice(0, 8)
      .join('')
      .trim() || "新对话";

  } catch (error) {
    console.error('AI标题生成失败:', error);
    // 回退方案：返回第一条用户消息
    const firstUserMessage = messages.find(m => m.role === 'user')?.content || '';
    return firstUserMessage.slice(0, 8) || "新对话";
  }
};


// 修改后的标题生成函数
const generateChatTitle = async (messages: Message[]) => {
  if (!messages?.length) return "新对话";
  
  // 直接生成标题，以后需要优化的地方QaQ
  return await generateAITitle(messages);
};


// 修改后的 getChats 方法

export const getChats = async (userId: number) => {
  const chats = await db
    .select({
      id: chatTable.id,
      messages: chatTable.messages,
      title: chatTable.title,
    })
    .from(chatTable)
    // 添加 JOIN 关联用户表
    .innerJoin(userTable, eq(chatTable.userId, userTable.id))
    .where(eq(chatTable.userId, userId));

  return chats.map(chat => ({
    id: chat.id,
    title: chat.title || "新对话",
  }));
};

// 新增聊天存储功能
// 修改后的 createChat 方法
export const createChat = async (userId: number): Promise<string> => {
  // 验证用户存在
  const user = await db.select()
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1);

  if (!user.length) {
    throw new Error("用户不存在");
  }

  // 生成聊天ID
  const id = generateId();
  
  // 插入数据库
  await db.insert(chatTable).values({
    id,
    userId,  // 关联用户ID
    messages: [],
    title: "新对话"
  });

  return id;
}

  
  export const getChatMessages = async (chatId: string) => {
    const [chat] = await db
      .select({ messages: chatTable.messages })
      .from(chatTable)
      .where(eq(chatTable.id, chatId));
  
    return chat?.messages || [];
  };
  
  export const appendChatMessage = async (chatId: string, message: any) => {
    // 获取当前聊天记录
    const chat = await db
      .select({ messages: chatTable.messages, title: chatTable.title })
      .from(chatTable)
      .where(eq(chatTable.id, chatId))
      .limit(1)
      .execute();
  
    if (!chat.length) return;
  
    const currentMessages = chat[0].messages as Message[];
  
    // 将新的消息添加到现有消息中
    const updatedMessages = [...currentMessages, message];
  
    // 如果标题是默认“新对话”，则更新标题
    let newTitle = chat[0].title;
    if (newTitle === "新对话") {
      newTitle = await generateChatTitle(updatedMessages); // 生成新的标题
    }
  
    // 更新聊天记录和标题
    await db
      .update(chatTable)
      .set({
        messages: sql`${sql.raw(JSON.stringify(updatedMessages))}`,
        title: newTitle,
      })
      .where(eq(chatTable.id, chatId));
  
    // 更新标题后触发 GET /api/get-chats 请求
    try {
      const response = await fetch('/api/get-chats');
      if (!response.ok) {
        console.error('更新标题后刷新聊天列表失败');
      } else {
        const chats = await response.json();
        console.log('更新后的聊天列表:', chats);
      }
    } catch (error) {
      console.error('请求更新聊天列表时发生错误:', error);
    }
  };
  
  // 添加更新标题的数据库操作
  export const updateChatTitle = async (chatId: string, newTitle: string) => {
    if (!chatId || !newTitle) return false
    await db
      .update(chatTable)
      .set({ title: newTitle })
      .where(eq(chatTable.id, chatId))
    return true
  }
  export async function loadChat(id: string, userId: number): Promise<Message[]> {
    // 同时查询聊天ID和用户ID进行过滤
     console.log(`查询参数: id=${id}, userId=${userId}`);
    const [chat] = await db
      .select({ 
        messages: chatTable.messages,
        title: chatTable.title,
        userId:chatTable.userId,
      })
      
      .from(chatTable)
      .where(
        and(         
          eq(chatTable.id, id),
          eq(chatTable.userId, userId),
        )
      );
      console.log(db.toString());  // 打印生成的 SQL 查询语句
    // 如果找不到匹配记录（ID或用户ID不匹配）返回空数组
    if (!chat) return [];
  
    // 返回消息记录
    return chat.messages as Message[];
  }
  
  // 删除聊天记录
  export const deleteChat = async (chatId: string): Promise<void> => {
    console.log(`正在删除ID为 ${chatId} 的聊天记录...`);
    try {
      // 使用 .returning() 获取操作结果
      const result = await db.delete(chatTable)
        .where(eq(chatTable.id, chatId))
        .returning();
  
      if (result.length === 0) {
        console.log('没有找到对应的聊天记录');
        throw new Error('未找到对应的聊天记录');
      }
      
      console.log(`删除成功，影响行数: ${result.length}`);
    } catch (error) {
      console.error('数据库删除操作失败:', error);
      throw new Error('删除聊天记录时发生错误');
    }
  };

// 修改后的 saveChat 方法
export async function saveChat({
  id,
  userId, // 新增用户ID参数
  messages,
}: {
  id: string;
  userId: number;
  messages: Message[];
}): Promise<void> {
  // 获取当前聊天记录的标题
  const existingChat = await db
    .select({ title: chatTable.title })
    .from(chatTable)
    .where(eq(chatTable.id, id))
    .limit(1)
    .execute();

  const existingTitle = existingChat[0]?.title || "新对话";

  // 如果标题是默认"新对话"，则更新标题
  const title = existingTitle === "新对话" ? await generateChatTitle(messages) : existingTitle;

  // 更新或插入聊天记录（添加 userId 到插入值）
  await db
    .insert(chatTable)
    .values({ id, userId, messages, title }) // 新增 userId 字段
    .onConflictDoUpdate({
      target: chatTable.id,
      set: { messages, title }, // 保持原有更新字段不变
    });
}