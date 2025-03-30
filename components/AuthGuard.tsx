"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isClient, setIsClient] = useState(false); // 新增客户端状态检测
  const router = useRouter();

  // 增强的登录状态检查
  const checkAuth = () => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = !!localStorage.getItem('user_id');
      setShowLoginModal(!isLoggedIn);
      return isLoggedIn;
    }
    return false;
  };

  useEffect(() => {
    setIsClient(true); // 标记客户端已加载
    checkAuth();
  }, []);

  // 监听storage变化
  useEffect(() => {
    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogin = () => {
    // 记录原始访问路径
    sessionStorage.setItem('preLoginUrl', window.location.pathname);
    router.push('/login');
    setShowLoginModal(false);
  };

  if (!isClient) return null; // 服务端渲染时返回空

  return (
    <>
      {children}
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="访问受限"
        closeOnClickOutside={false}
      >
        <div className="p-4 text-center space-y-4">
          <p className="text-gray-600">请登录后继续操作</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleLogin}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              立即登录
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}