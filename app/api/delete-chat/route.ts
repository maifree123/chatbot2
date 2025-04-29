import { NextRequest, NextResponse } from 'next/server';
import { deleteChat } from '@/db/index'; 

export async function DELETE(req: NextRequest) {
  try {
    const { chatId } = await req.json();  // 解析请求体中的 chatId

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    await deleteChat(chatId); // 删除函数
    return NextResponse.json({ message: 'Chat deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}
