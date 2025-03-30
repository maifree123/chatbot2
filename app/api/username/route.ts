import { NextResponse } from 'next/server';
import { getUserByUsername2 } from '@/db'; // 引入你之前写的数据库查询方法

// 处理 GET 请求
export async function GET(req: Request) {
  // 从请求头中获取 'X-User-ID'
  const userIdHeader = req.headers.get('X-User-ID');

  if (!userIdHeader) {
    return NextResponse.json({ message: '缺少 X-User-ID 请求头' }, { status: 400 });
  }

  // 将 userId 转换为数字
  const userId = Number(userIdHeader);

  if (isNaN(userId)) {
    return NextResponse.json({ message: '无效的 X-User-ID' }, { status: 400 });
  }

  try {
    // 查询数据库，使用获取的 userId 查找用户
    const user = await getUserByUsername2(userId);

    if (user) {
      return NextResponse.json(user); // 返回查询到的用户数据
    } else {
      return NextResponse.json({ message: '用户未找到' }, { status: 404 });
    }
  } catch (error) {
    console.error('查询用户失败:', error);
    return NextResponse.json({ message: '服务器错误' }, { status: 500 });
  }
}
