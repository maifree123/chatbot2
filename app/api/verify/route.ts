// /api/verify.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server'
export async function GET(req: NextRequest) {
  try {
    const userId = req.cookies.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ message: '未登录' }, { status: 401 });
    }

    // 在这里可以执行更多的身份验证逻辑，例如检查用户是否有效
    return NextResponse.json({ message: '用户已验证成功' });

  } catch (error) {
    return NextResponse.json({ message: '验证失败' }, { status: 500 });
  }
}
