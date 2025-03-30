// app/api/rename-chat/route.ts
import { NextResponse } from 'next/server'
import { updateChatTitle } from '@/db/index'

export async function PUT(req: Request) { 
  try {
    const { chatId, newTitle } = await req.json()

    // 参数验证
    if (!chatId || typeof newTitle !== 'string') {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      )
    }

    const success = await updateChatTitle(chatId, newTitle)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('重命名错误:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}