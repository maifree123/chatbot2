import { NextResponse } from 'next/server';
import { registerUser } from '@/db/index'; // 引入注册功能

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // 调用注册功能
    const user = await registerUser(username, password);
    
    // 返回注册成功信息
    return NextResponse.json({ message: "注册成功", userId: user.id });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: '发生未知错误' }, { status: 400 });
  }
}
