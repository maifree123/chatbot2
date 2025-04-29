// app/api/custom-settings/route.ts
import { saveUserPreferences, getUserPreferences  } from '@/db/index'; // 引入保存用户偏好的函数


// 获取用户偏好
export async function GET(req: Request) {
  try {
    const userId = Number(req.headers.get('X-User-ID')); // 获取用户ID
    console.log('收到请求，用户ID:', userId); 

    const preferences = await getUserPreferences(userId); // 从数据库中获取用户偏好
    console.log('数据库查询结果:', preferences); 

    return Response.json(preferences || {}); // 如果没有找到偏好，返回空对象
  } catch (error) {
    console.error('GET处理错误:', error); 
    return Response.json({ error: '获取设置失败' }, { status: 500 });
  }
}
// 保用户偏好设置
export async function POST(req: Request) {
  try {
    // 获取请求中的用户 ID 和偏好设置
    const userId = Number(req.headers.get('X-User-ID')); // 从请求头获取用户 ID
    const { preferredName, traits, preferences } = await req.json(); // 从请求体获取偏好设置
    
    // 检查请求是否包含用户的偏好设置
    if (!preferredName || !traits || !preferences) {
      return new Response(JSON.stringify({ error: '缺少必要的偏好设置' }), { status: 400 });
    }

    //保存用户偏好设置
    await saveUserPreferences(userId, preferredName, traits, preferences);

    // 返回成功响应
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('保存用户偏好设置失败:', error);
    return new Response(JSON.stringify({ error: '保存用户偏好设置失败' }), { status: 500 });
  }
}
