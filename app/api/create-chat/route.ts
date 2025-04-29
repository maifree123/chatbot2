// app/api/create-chat/route.ts
import { createChat } from '@/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { userId } = await req.json(); // 请求体获取用户标识
    
    if (!userId) {
      return NextResponse.json(
        { error: "缺少用户标识" }, 
        { status: 400 }
      );
    }

    const id = await createChat(userId);
    return NextResponse.json({ id });
    
  } catch (error) {
    console.error('创建聊天失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}