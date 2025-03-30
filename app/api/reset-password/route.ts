import { NextResponse } from 'next/server';
import { updateUserPassword } from '@/db/index';

export async function POST(req: Request) {
  try {
    const { username, oldPassword, newPassword } = await req.json();
    
    if (!username || !oldPassword || !newPassword) {
        return NextResponse.json(
          { error: '所有字段不能为空' },
          { status: 400 }
        );
      }
      

      await updateUserPassword(username, oldPassword, newPassword);
    
    return NextResponse.json({ 
      message: "密码重置成功，请使用新密码登录" 
    });
    
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: '发生未知错误' },
      { status: 500 }
    );
  }
}