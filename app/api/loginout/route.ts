import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // 创建响应
    const response = NextResponse.json({
      message: '登出成功'
    });

    // 清除用户cookie
    response.cookies.delete('user_id');

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { message: `登出失败: ${errorMessage}` },
      { status: 500 }
    );
  }
}