import { useState, useEffect } from 'react';

const ProfileSettings = () => {
  const [user, setUser] = useState<any>(null);
  const userId = '123';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/username`, {
          method: 'GET',
          headers: {
            'X-User-ID': userId,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          console.error('用户未找到');
        }
      } catch (error) {
        console.error('获取用户数据失败:', error);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleLogout = async () => {
    if (!window.confirm('确定要永久删除账户吗？此操作不可撤销！')) return;
    try {
      const response = await fetch('/api/delete-user', {
        method: 'DELETE',
        headers: {
          'X-User-ID': userId,
        },
      });
      
      if (response.ok) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user_id');
        window.location.href = '/login';
      } else {
        const errorData = await response.json();
        alert(`删除失败: ${errorData.message}`);
      }
    } catch (error) {
      alert('删除请求失败，请检查网络连接');
    }
  };

  return (
    <div className="rounded-xl border bg-white shadow dark:bg-gray-900 dark:border-gray-800">
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="font-semibold dark:text-gray-100">个人信息</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">管理您的个人信息和偏好。</div>
      </div>

      <div className="space-y-6 p-4">
        <div className="border-t border-gray-200 dark:border-gray-800"></div>

        <div className="grid gap-6">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm dark:text-gray-300">用户名</label>
            <input 
              id="username" 
              value={user?.username || '加载中...'}
              readOnly
              className="border px-4 py-2 rounded-md w-full text-sm bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="flex items-center p-6 pt-0">
          <button 
            className="px-6 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600 text-sm transition-colors"
            onClick={handleLogout}
          >
            注销
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;