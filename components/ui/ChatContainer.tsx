"use client";

import { createIdGenerator } from 'ai';
import { useChat } from 'ai/react';
import React, { useEffect, useRef, useState} from 'react';
import { Button } from './button';
import { Message } from 'ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { ArrowRight, Paperclip, BrainCog,  MessageSquareMore,  Globe , BookOpenText, Square, Copy, BookOpen} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion'; // 新增导入

type Props = {
  id?: string;
  initialMessages?: Message[];
  enableWebSearch?: string;// 联网开关
};




const ChatContainer = ({ id, initialMessages }: Props) => {
  const router = useRouter();
// 在 ChatContainer 组件中添加以下状态（状态表)
const [typingMessage, setTypingMessage] = useState<string>('');  // 控制提示语的打字效果
const [messageIndex, setMessageIndex] = useState<number>(0);      // 控制已显示字符的位置
// 提示
const fullMessage = '有什么可以帮忙的？';  // 要显示的提示语
const [pdfContent, setPdfContent] = useState('');
//预览PDF
const [showPdfPreview, setShowPdfPreview] = useState(false);
const [pdfUrl, setPdfUrl] = useState<string | null>(null);
// 在状态定义部分添加联网功能
const [enableWebSearch, setEnableWebSearch] = useState(false); // 默认关闭联网
//RAG
const [enableRAG,setEnableRAG] = useState(false);
//动画按钮
const MotionButton = motion(Button);
const [isNavigating, setIsNavigating] = useState(false);
const skipAnimation = new URLSearchParams(window.location.search).has('noAnimation');
//跳转逻辑
const [newChatId, setNewChatId] = useState<string | null>(null);
//文件提交
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

    // 清理之前的预览
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  // 添加文件类型校验
  if (file.type !== 'application/pdf') {
    toast.error('仅支持 PDF 文件');
    return;
  }

  try {
    // 生成预览 URL
    const previewUrl = URL.createObjectURL(file);
    setPdfUrl(previewUrl);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/uploadprompt', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error();
    
    const { content } = await response.json();
    setPdfContent(content);
    console.log('PDF 内容已加载:', content); // 添加此行
    toast.success('PDF 已加载');
  } catch {
    toast.error('PDF 解析失败');
  } finally {
    if (e.target) e.target.value = '';
  }
};
  // 清理函数
  const closePreview = () => {
    setShowPdfPreview(false);
  };
  //清除文件和内容
const clearPdfContent = () => {
  setPdfContent('');
  if (pdfUrl) {
    URL.revokeObjectURL(pdfUrl); // 清理 URL
    setPdfUrl(null); // 清除 PDF URL
  }
};
// 组件卸载时清理
useEffect(() => {
  return () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
  };
}, [pdfUrl]);



  // 在组件内部添加状态
  const [selectedModel, setSelectedModel] = useState<'deepseek-reasoner' | 'deepseek-chat'>('deepseek-chat');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop,  error, reload  } = useChat({
    id,
    initialMessages,
    api: '/api/chat',
    sendExtraMessageFields: true,
    body: { model: selectedModel, pdfContent , enableWebSearch, enableRAG },
    fetch: (url, options) => {
      const userId = localStorage.getItem('user_id') // 直接从本地存储获取
      // 安全处理 options 可能为 undefined 的情况
      const mergedOptions = {
        ...options, // 保留原有 options
          headers: {
          ...options?.headers, // 使用可选链
          'x-user-id': userId || '' // 直接设置请求头
        }
      };
      
      return fetch(url, mergedOptions);
    },
    onError: (error) => {
      toast.error(error.message || '请求失败，请重试');
    },
    generateId: createIdGenerator({
      prefix: 'msgc',
      size: 16,
    }),
    onResponse(response) {
      const chatId = response.headers.get('x-chat-id');
      if (chatId) {
        setNewChatId(chatId); // 存储 chatId 到状态
      }
    },
    onFinish: () => {
      setPdfContent('');
      // 不再在此处跳转
    },
  });
  useEffect(() => {
    if (newChatId && !id && !isLoading) {
      router.replace(`/chat/${newChatId}?noAnimation=true`);
      setNewChatId(null); // 清除 chatId 防止重复跳转
    }
  }, [newChatId, isLoading, id, router]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // 调整 textarea 高度
  const adjustHeight = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      // 当输入为空时，直接恢复到最小高度
      if (!textarea.value) {
        textarea.style.height = '2rem';
        textarea.style.overflowY = 'hidden';
        return;
      }
      textarea.style.height = 'auto';
      textarea.style.overflowY = 'hidden';

      const maxHeight = 10 * 16; // 10rem
      const scrollHeight = textarea.scrollHeight;

      if (scrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.height = `${scrollHeight}px`;
      }
    }
  };

  // 当消息或输入内容改变时调用 adjustHeight，使输入框自动恢复原状
  useEffect(() => {
    adjustHeight();
  }, [messages, input]);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 修改后的useEffect部分
  useEffect(() => {
    let typingInterval: NodeJS.Timeout;

    // 当没有消息时启动打字效果
    if (messages.length === 0) {
      typingInterval = setInterval(() => {
        setMessageIndex((prev) => {
          // 当达到完整信息长度时清除定时器
          if (prev >= fullMessage.length) {
            clearInterval(typingInterval);
            return prev;
          }
          return prev + 1;
        });
      }, 100); // 调整为更合理的100ms间隔
    }

  // 清理函数：组件卸载或依赖变化时清除定时器
  return () => {
    if (typingInterval) clearInterval(typingInterval);
  };
  }, [messages.length]); // 仅依赖messages.length

  // 新增一个effect来处理信息更新
  useEffect(() => {
    setTypingMessage(fullMessage.slice(0, messageIndex));
  }, [messageIndex]);
  //复制功能
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };
  return (
    
    <div className="relative h-full w-full bg-background">
      {/* 聊天消息区域：绝对定位，并在底部预留足够空间给输入区域 */}
      <div className="absolute inset-0 overflow-auto p-4 pb-[12rem]">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((message) => {
            
            if (message.role === 'user') {
              return (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-full p-2 shadow-sm bg-blue-100 dark:bg-blue-900/50 backdrop-blur-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      className="Inter dark:prose-invert prose-lg"
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={message.id} className="flex justify-start gap-3">
                  {/* 添加AI头像 */}
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <BrainCog size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="w-full max-w-[95%] p-4" style={{ fontFamily: 'Inter, sans-serif' }}>

                    {/* 插入推理过程显示区块 */}
                    {message.reasoning && (
                      <div className="mb-3 p-4 bg-muted rounded-lg border border-muted-foreground/20">
                        <div className="text-xs font-medium text-muted-foreground mb-2">
                          推理过程 🤔
                        </div>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                          className="prose-sm prose-muted-foreground break-words"
                        >
                          {message.reasoning}
                        </ReactMarkdown>
                      </div>
                    )}
            
                    {/* 原有内容部分保持不变 */}
                    <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    className="prose dark:prose-invert prose-lg"
                    components={{
                      code({ node, className, children, ...props }) {
                        // 简单粗暴的复制功能
                        const copy = () => {
                          navigator.clipboard.writeText(children as string);
                          toast.success('已复制');
                        };

                        return (
                          <div className="relative">
                            <code className={className} {...props}>
                              {children}
                            </code>
                            <button
                              onClick={copy}
                              className="absolute top-2 right-2 opacity-50 hover:opacity-100 transition-opacity"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                        );
                      }
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                  </div>
                </div>
              );
            }
          })}

            {isLoading && (
              <div className="flex justify-center">
                <div className="w-full max-w-[85%] p-4">
                <div className="flex justify-center items-center">
                  <div className="w-6 h-6 border-4 border-t-transparent primary rounded-full animate-spin"></div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center animate-fade-in mt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-full border border-destructive/20">
                  <span>请求失败，点击重试</span>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="h-6 text-destructive hover:bg-destructive/20 -mr-2"
                    onClick={() => reload()}
                  >
                    重试
                  </Button>
                </div>
              </div>
            )}

            <div ref={endRef} />
        </div>
      </div>

      {/* 输入区域：根据消息数量决定定位方式 */}
      <form
        className={`w-full flex flex-row justify-center items-end px-4 absolute left-0 transition-all duration-500 ${
          messages.length > 0
            ? 'bottom-0'
            : 'top-1/2 transform -translate-y-1/2'
        }`}
        onSubmit={handleSubmit}
      >
        <div className="w-full max-w-[85%] md:max-w-2xl lg:max-w-2xl">
          {/* 新增提示语 */}
          {messages.length === 0 && (
            <div className="mb-6 text-center space-y-2">
              {/* 需要更改的地方：为欢迎语添加淡入动画 */}
              <motion.div 
                className="text-4xl font-extrabold text-black dark:text-white"
                initial={skipAnimation ? {} : { opacity: 0 }}  // 初始透明
                animate={skipAnimation ? {} : { opacity: 1 }}  // 动画完成时不透明
                transition={skipAnimation ? {} : { delay: 0.3, duration: 0.6 }}  // 延迟0.3秒，持续0.6秒
              >
                {typingMessage}
              </motion.div>

              {/* 需要更改的地方：为说明文字添加淡入动画 */}
              <motion.div
                className="text-sm text-muted-foreground"
                initial={skipAnimation ? {} : { opacity: 0 }}  // 初始透明
                animate={skipAnimation ? {} : { opacity: 1 }}  // 动画完成时不透明
                transition={skipAnimation ? {} : { delay: 0.5, duration: 0.6 }}  // 延迟0.5秒，持续0.6秒
              >
                Reason是推理模式，chat是正常模式，全局上传用于查询，单聊天上传用于分析。
              </motion.div>
            </div>
          )}

        <div className="w-full max-w-[85%] md:max-w-2xl lg:max-w-2xl">
          
        {/* 外层大框容器 */}
        <motion.div
        initial={skipAnimation ? false :{ y: 20, opacity: 0 }}
        animate={skipAnimation ? {} :{ y: 0, opacity: 1 }}
        transition={{ duration: skipAnimation ? 0 : 0.8, ease: "easeOut" }}
        className="w-full max-w-[85%] md:max-w-2xl lg:max-w-2xl">

        <div className="bg-input rounded-3xl shadow-sm hover:shadow-md transition-shadow min-h-[2rem] p-4 pb-[3rem] relative">
          
          {/* PDF 预览和文件标识区域 */}
          {pdfUrl && (
            <div className="mb-2 flex items-center gap-2 animate-fade-in">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full px-3 py-1 text-sm hover:bg-accent/50"
                onClick={() => setShowPdfPreview(true)}
              >
                📄 已加载 PDF 文档（点击预览）
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive"
                onClick={clearPdfContent}  
                >
                ×
              </Button>
            </div>
          )}

          {/* PDF 预览模态框 */}
          
          {showPdfPreview && pdfUrl && (
            
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-background rounded-xl max-w-4xl max-h-[90vh] w-full flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-lg font-semibold">PDF 预览</h2>
                  <Button 
                    variant="ghost" 
                    onClick={closePreview}
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>
                <div className="flex-1 overflow-auto">
                  <iframe 
                    src={pdfUrl + "#toolbar=0"} 
                    className="w-full h-full min-h-[70vh]"
                     title="上传PDF文档"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 输入框 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-[85%] md:max-w-2xl lg:max-w-2xl">

            <textarea
              ref={textareaRef}
              className="w-full rounded-lg p-3 pl-4 pr-10 bg-input resize-none focus:outline-none text-sm border border-input overflow-y-auto theme-scrollbar"
              style={{
                minHeight: '2rem',
                maxHeight: '10rem',
                boxSizing: 'border-box',

              }}
              name="prompt"
              value={input}
              onChange={(e) => {
                handleInputChange(e);
                adjustHeight();
              }}
              placeholder="Send a message..."
              rows={1}
              disabled={isLoading || !!error} // 🛠️ 添加禁用判断
            />
            </motion.div>
            {/* 按钮区域固定在外层容器底部 */}
            <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center">
              <div className="flex items-center">
              <MotionButton 
                  whileHover={{ y: -5, scale: 1.02 }}
                  type="button"
                  variant="ghost"
                   className="h-7 px-2 rounded-md text-sm tooltip hover:bg-primary hover:text-primary-foreground"
                  onClick={() => fileInputRef.current?.click()}
                > 
                  <Paperclip size={20} strokeWidth={2}  />
                  <span className="tooltip-text">上传</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept="application/pdf"
                    onChange={handleFileUpload}
                  />
                
                </MotionButton>
                {/* 模型切换按钮 */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                <MotionButton
                    whileHover={{ y: -5 , scale: 1.02 }}
                    type="button"
                    variant={selectedModel === 'deepseek-reasoner' ? 'default' : 'ghost'}
                    className={cn(
                      'h-7 px-2 rounded-md text-sm tooltip hover:bg-primary dark:hover:bg-primary hover:text-primary-foreground',
                      selectedModel === 'deepseek-reasoner' && 'bg-primary text-primary-foreground'
                    )}
                    onClick={() => setSelectedModel('deepseek-reasoner')}
                    
                  >
                    <BrainCog size={20} strokeWidth={2}  />
                    <span className="tooltip-text">推理模式</span>
                    </MotionButton>
                  <MotionButton 
                    whileHover={{ y: -5, scale: 1.02 }}
                    type="button"
                    variant={selectedModel === 'deepseek-chat' ? 'default' : 'ghost'}
                    className={cn(
                      'h-7 px-2 rounded-md text-sm tooltip hover:bg-primary dark:hover:bg-primary hover:text-primary-foreground',
                      selectedModel === 'deepseek-chat' && 'bg-primary text-primary-foreground'
                    )}
                    onClick={() => setSelectedModel('deepseek-chat')}
                  >
                    <MessageSquareMore size={16} strokeWidth={2}/>
                    <span className="tooltip-text">聊天模式</span>
                  </MotionButton >
                  
                </div>
                  {/* 新增的联网搜索开关（替换原来的Button） */}

                  <MotionButton 
                    whileHover={{ y: -5, scale: 1.02 }}
                      type="button"
                      variant={enableWebSearch ? "default" : "ghost"}
                      className={cn(
                        "ml-2 h-7 w-7 rounded-lg flex items-center justify-center tooltip",
                        enableWebSearch 
                          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                      onClick={() => setEnableWebSearch(!enableWebSearch)}
                      aria-label={enableWebSearch ? "关闭联网搜索" : "启用联网搜索"}
                    >
                      <Globe 
                        size={16} 
                        strokeWidth={2.2} 
                        className={cn(
                          "transition-all ",
                          enableWebSearch 
                            ? "animate-pulse text-primary-foreground" 
                            : "text-muted-foreground"
                        )}
                      />
                      <span className="tooltip-text">网络</span>
                      </MotionButton>
                    
                     {/* 开启或关闭RAG功能的按钮 */}
                     <MotionButton 
                  whileHover={{ y: -5, scale: 1.02 }}       
                  type="button"
                  variant={enableRAG ? "default" : "ghost"}
                  className={cn(
                    "ml-2 h-7 w-7 rounded-lg flex items-center justify-center tooltip",
                    enableRAG 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "bg-muted text-muted-foreground hover:bg-muted/90"
                  )}
                  onClick={() => setEnableRAG(!enableRAG)}
                  aria-label={enableRAG ? "关闭RAG功能" : "启用RAG功能"}
                >
                  <BookOpenText size={16} strokeWidth={2} className={cn("transition-all", enableRAG ? "animate-pulse text-primary-foreground" : "text-muted-foreground")} />
                  <span className="tooltip-text">知识库</span>
                  </MotionButton>
              </div>

              <div className="relative h-7 w-7">
                {/* 发送按钮 - 正常状态时显示 */}
                <Button
                  type="submit"
                  className={cn(
                    "absolute h-7 w-7 rounded-full flex items-center justify-center transition-all",
                    input 
                      ? "bg-primary text-primary-foreground hover:bg-primary/70 opacity-100"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-70",
                    isLoading ? "scale-0 opacity-0" : "scale-100 opacity-100" // 加载时隐藏
                  )}
                  disabled={!input || isLoading || !!error}
                >
                  <ArrowRight size={20} strokeWidth={3} />
                </Button>

                {/* 停止按钮 - 加载时显示 */}
                <Button
                type="button"
                onClick={stop}
                className={cn(
                  "absolute h-7 w-7 rounded-full flex items-center justify-center bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all",
                  isLoading ? "scale-100 opacity-100" : "scale-0 opacity-0"
                )}
              >
                <Square 
                  size={16}  // 调整到与箭头图标视觉平衡
                  strokeWidth={3}  // 保持与箭头相同的笔触粗细
                  className="translate-y-[0.5px]" // 微调垂直居中
                />
              </Button>
              </div>
            </div>
          </div>
          </motion.div>
        </div>
      </div>
      </form>
    </div>
  );
};

export default ChatContainer;
