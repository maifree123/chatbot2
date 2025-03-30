'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import { MessageSquare, ChevronRight, Sparkles } from "lucide-react";

export default function Page() {
  return (
    <div className="h-screen w-screen bg-gray-100 dark:bg-black flex flex-col relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-gray-300/30 blur-3xl dark:bg-gray-900/20" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-gray-200/30 blur-3xl dark:bg-gray-900/20" />

      {/* 主内容容器 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex flex-col items-center justify-center px-4 max-w-2xl mx-auto"
      >
        {/* 标题区 */}
        <div className="space-y-6 text-center mb-16">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-block p-4 rounded-2xl bg-white/30 dark:bg-gray-900/50 backdrop-blur-md shadow-lg"
          >
            <MessageSquare className="h-12 w-12 text-black dark:text-gray-200" />
          </motion.div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-black to-gray-800 bg-clip-text text-transparent dark:from-white dark:to-gray-200">
            ChatAI
            <Sparkles className="inline-block ml-2 h-8 w-8 text-gray-500 dark:text-gray-400" />
          </h1>
          <p className="text-xl text-gray-800 dark:text-gray-300 mt-4">
            知识库问答 · deepseek · 小组协作
          </p>
        </div>

        {/* 操作按钮组 */}
        <div className="w-full space-y-6">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/login">
              <Button 
                size="lg"
                className="w-full h-16 text-lg rounded-[6rem] bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-black shadow-xl transition-all
                           dark:from-gray-200 dark:to-white dark:text-black"
              >
                <MessageSquare className="mr-3 h-5 w-5" />
                开始新对话
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          <div className="flex justify-center space-x-4">
            <motion.div whileHover={{ y: -2 }}>
              <Link href="/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 h-12 border-2 border-gray-400 hover:border-black
                             dark:border-gray-600 dark:hover:border-white dark:text-gray-200"
                >
                  免费注册
                </Button>
              </Link>
            </motion.div>
          </div>
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
}