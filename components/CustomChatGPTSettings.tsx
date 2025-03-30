import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button"; // 确保使用统一按钮组件
const CustomChatGPTSettings = ({ userId }: { userId: number }) => {
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [preferredName, setPreferredName] = useState('');
  const [preferences, setPreferences] = useState('');

  // 增强版初始化逻辑
  useEffect(() => {
    const initSettings = async () => {
      try {
        console.log('正在初始化设置，用户ID:', userId); // 调试日志
        // 发送请求
        const response = await fetch('/api/custom-settings', {
        });

        console.log('响应状态:', response.status); // 调试日志
        
        // 处理非200响应
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API错误: ${errorData.error || '未知错误'}`);
        }

        // 解析数据
        const responseData = await response.json();
        console.log('收到响应数据:', responseData); // 调试日志

        // 安全解构数据
        const {
          preferredName = '',
          traits = [],
          preferences = ''
        } = responseData || {};

        // 批量更新状态
        setPreferredName(preferredName);
        setSelectedTraits(traits);
        setPreferences(preferences);

      } catch (error) {
        console.error('初始化失败详情:', error);
        alert(`初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    };

    initSettings();
  }, [userId]);


  const handleTraitToggle = (trait: string) => {
    setSelectedTraits(prev =>
      prev.includes(trait)
        ? prev.filter(t => t !== trait)
        : [...prev, trait]
    );
  };

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('/api/custom-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': String(userId), // 确保将 userId 作为请求头传递
        },
        body: JSON.stringify({
          preferredName,
          traits: selectedTraits,  // 这里已经是 string[] 类型
          preferences,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('设置已保存！');
      } else {
        alert('保存设置失败');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('保存设置时出错');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 backdrop-blue-lg shadow-xl"
    >
      <div className="flex flex-col space-y-1.5 p-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          智能助手设置
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          个性化您的AI交互体验
        </p>
      </div>

      <div className="space-y-8 p-8">
        {/* 名称输入 */}
        <div className="space-y-3">
          <label className="text-gray-900 dark:text-gray-200" htmlFor="preferred-name">
            ChatGPT应该如何称呼您？
          </label>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            id="preferred-name"
            placeholder="输入您的偏好名称"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
          />
        </div>

        {/* 身份信息 */}
        <div className="space-y-3">
          <label className="text-gray-900 dark:text-gray-200">您的身份/职业</label>
          <input
            value="广商学生"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            readOnly
          />
        </div>

        {/* 特征选择 */}
        <div className="space-y-5">
          <label className="text-gray-900 dark:text-gray-200">
            ChatGPT应具备的特征（多选）
          </label>
          <div className="grid grid-cols-2 gap-4">
            {['健谈', '诙谐', '直言不讳', '鼓励性', '世代', '怀疑', '传统型', '前瞻性思维', '诗意'].map((trait) => (
              <motion.button
                key={trait}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-3 rounded-xl border-2 transition-colors ${
                  selectedTraits.includes(trait)
                    ? 'bg-blue-600 text-white border-blue-700 dark:bg-blue-500 dark:border-blue-600'
                    : 'border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800'
                }`}
                onClick={() => handleTraitToggle(trait)}
              >
                {trait}
              </motion.button>
            ))}
          </div>
        </div>

        {/* 其他偏好 */}
        <div className="space-y-3">
          <label className="text-gray-900 dark:text-gray-200">其他偏好信息</label>
          <motion.textarea
            whileFocus={{ scale: 1.02 }}
            placeholder="请输入需要AI记住的兴趣、价值观或偏好..."
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-32 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-4 pt-8">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className="rounded-full px-8 h-12 border-2 border-gray-300 text-gray-700 hover:border-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-400"
            >
              取消
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSaveSettings}
              className="rounded-full px-8 h-12 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              保存设置
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
export default CustomChatGPTSettings;