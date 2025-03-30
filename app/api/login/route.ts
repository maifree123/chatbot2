import { NextResponse } from 'next/server';
import { getUserByUsername } from '@/db';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const user = await getUserByUsername(username);

    if (!user) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 401 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json(
        { message: '密码错误' },
        { status: 401 }
      );
    }

    // 创建响应并设置cookie
    const response = NextResponse.json({
      userId: user.id,
      username: user.username,
      message: '登录成功'
    });

    // 设置cookie（有效期30天）
    response.cookies.set('user_id', user.id.toString(), {
      httpOnly: true,
      maxAge: 2592000,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    return response;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { message: `登录失败: ${errorMessage}` },
      { status: 500 }
    );
  }
}