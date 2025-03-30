'use client';
import React from 'react';
import { User, CreditCard, ArrowRightCircle, Key, LogOut, Bot } from 'lucide-react';
import ProfileSettings from '@/components/ProfileSettings';
import CustomChatGPTSettings from '@/components/CustomChatGPTSettings';
import ApiKeySettings from '@/components/ApiKeySettings';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle'
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

type Tab = 'profile' | 'custom-chatgpt';

type SettingsPageProps = {
  userId: number; 
};

const SettingsPage: React.FC<SettingsPageProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'custom-chatgpt':
        return <CustomChatGPTSettings userId={userId}/>;
     /* case 'api-key':*/
       /* return  <ApiKeySettings />;*/
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100/50 dark:bg-black/90 relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-gray-300/30 blur-3xl dark:bg-gray-900/20" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-gray-200/30 blur-3xl dark:bg-gray-900/20" />

      {/* 侧边栏 */}
      <motion.aside 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 bg-white/70 dark:bg-gray-900/60 backdrop-blur-lg border-r border-gray-200/50 dark:border-gray-800/30 shadow-xl p-6"
      >
        <div className="flex flex-col space-y-8 h-full">
          {/* 标题区 */}
          <motion.div 
            className="flex items-center justify-between"
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
              设置中心
            </h2>
            <Link href="/chat">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-500 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
              >
                <LogOut size={24} />
              </Button>
            </Link>
          </motion.div>

          {/* 导航菜单 */}
          <nav className="space-y-3 flex-1">
            {[
              { tab: 'profile', icon: User, label: '个人资料' },
              /*{ tab: 'api-key', icon: Key, label: 'API 密钥' },*/
              { tab: 'custom-chatgpt', icon: Bot, label: '智能助手' }
            ].map(({ tab, icon: Icon, label }) => (
              <motion.button
                key={tab}
                whileHover={{ x: 5 }}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${
                    activeTab === tab 
                    ? 'bg-gradient-to-r from-gray-800 to-black text-white shadow-lg dark:from-gray-200 dark:to-white dark:text-black'
                    : 'text-gray-600 hover:bg-gray-100/30 dark:text-gray-300 dark:hover:bg-gray-800/30'
                  }`}
                onClick={() => setActiveTab(tab as Tab)}
              >
                <Icon className="mr-3 h-5 w-5" />
                {label}
                {activeTab === tab && (
                  <ArrowRightCircle className="ml-auto h-4 w-4 text-white/80 dark:text-black/80" />
                )}
              </motion.button>
            ))}
          </nav>

          {/* 底部登出按钮 */}
          <motion.div 
            className="border-t border-gray-200/50 dark:border-gray-800/30 pt-6"
            whileHover={{ scale: 1.02 }}
          >
            <Link href="/login">
              <Button
                variant="destructive"
                className="w-full h-12 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-md hover:shadow-lg"
              >
                <LogOut className="mr-2 h-4 w-4" />
                安全登出
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.aside>

      {/* 主体内容 */}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 overflow-y-auto p-8 bg-transparent"
      >
        <div className="max-w-3xl mx-auto space-y-8">
          <motion.div 
            className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-lg rounded-2xl shadow-xl p-8"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </motion.main>

      {/* 主题切换 */}
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

export default SettingsPage;