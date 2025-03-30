// pages/api/user-preferences.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserPreferences } from '@/db/index';

// pages/api/user-preferences.ts
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = Number(req.query.userId);
  
  try {
    const data = await getUserPreferences(userId);
    res.status(200).json({
      success: true,
      preferences: data ? {
        preferredName: data.preferredName || '',
        traits: data.traits || [], // 确保返回数组类型
        preferences: data.preferences || ''
      } : null
    });
  } catch (error) {
    console.error('获取用户偏好失败:', error);
    res.status(500).json({ success: false, error: '服务器错误' });
  }
};