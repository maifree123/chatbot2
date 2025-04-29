"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageSquare, Loader2, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from "@/components/ThemeToggle";

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      console.log('开始发送登录请求...');
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',  // 确保请求携带 cookie
      });
  
      const data = await response.json();
      
      console.log('登录请求响应:', data);
      
      if (!response.ok) {
        throw new Error(data.message || '登录失败');
      }
  
      // 清空表单并跳转
      setUsername('');
      setPassword('');
      // 删除用户可能携带的凭证
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user_id');
      // 存储用户凭证
      localStorage.setItem('user_id', data.userId);  // 存储用户ID
      localStorage.setItem('isLoggedIn', 'true'); // 添加全局登录状态标识

      await new Promise(resolve => setTimeout(resolve, 300));
      const preLoginUrl = sessionStorage.getItem('preLoginUrl') || '/chat';
      router.push(preLoginUrl);
      sessionStorage.removeItem('preLoginUrl');
      
    } catch (error: unknown) {
      console.error('登录失败:', error);
      if (error instanceof SyntaxError) {
        setErrorMessage('服务器响应异常');
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('未知错误');
      }
    } finally {
      setLoading(false);
    }
  };

  // 在跳转之前验证用户身份
const verifyUserIdentity = async () => {
  try {
    const response = await fetch('/api/verify', {
      method: 'GET',
      credentials: 'include',  // 确保请求携带 cookie
    });

    if (!response.ok) {
      throw new Error('验证失败');
    }
  } catch (error) {
    console.error('身份验证失败:', error);
  }
};

  return (
    <div className="h-screen w-screen bg-gray-100 dark:bg-black flex flex-col relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-gray-300/30 blur-3xl dark:bg-gray-900/20" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-gray-200/30 blur-3xl dark:bg-gray-900/20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex flex-col items-center justify-center px-4 max-w-md mx-auto"
      >
        <div className="w-full space-y-8">
          {/* 标题区 */}
          <motion.div 
            className="space-y-6 text-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <div className="inline-block p-4 rounded-2xl bg-white/30 dark:bg-gray-900/50 backdrop-blur-md shadow-lg">
              <MessageSquare className="h-12 w-12 text-black dark:text-gray-200" />
            </div>
            <h1 className="text-4xl font-bold text-black dark:text-white">
              用户登录
              <Sparkles className="inline-block ml-2 h-8 w-8 text-gray-500 dark:text-gray-400" />
            </h1>
          </motion.div>

          {/* 登录表单 */}
          <motion.div 
            className="bg-white/30 dark:bg-gray-900/30 backdrop-blur-md rounded-3xl p-8 shadow-xl"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 p-4 bg-red-100/80 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl flex items-center"
              >
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {errorMessage}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  用户名
                </label>
                <motion.div whileHover={{ scale: 1.02 }}>
                  <input
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </motion.div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  密码
                </label>
                <motion.div whileHover={{ scale: 1.02 }}>
                  <input
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </motion.div>
              </div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-[4rem] text-lg font-medium transition-all flex items-center justify-center
                    ${loading 
                      ? 'bg-gray-400 cursor-not-allowed dark:bg-gray-700' 
                      : 'bg-black hover:bg-gray-900 text-white shadow-lg dark:bg-gray-800 dark:hover:bg-gray-700'
                    }`}
                >
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-white dark:text-gray-200" />
                  ) : (
                    <>
                      <ChevronRight className="h-5 w-5 mr-2" />
                      立即登录
                    </>
                  )}
                </button>
              </motion.div>
            </form>

          <div className="mt-6 text-center space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              没有账号？{' '}
              <Link 
                href="/register" 
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                立即注册
              </Link>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              忘记密码？{' '}
              <Link
                href="/ForgotPasswordPage"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                找回密码
              </Link>
            </div>
          </div>
          </motion.div>
        </div>
      </motion.div>

      {/* 主题切换按钮 */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed bottom-8 right-8"
      >
        <ThemeToggle />
      </motion.div>

      {/* 水印文字 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-gray-400/60 dark:text-gray-500/60">
        Powered by Next.js & Tailwind CSS
      </div>
    </div>
  );
};

export default LoginPage;