// app/api/get-chats/route.ts
import { getChats } from "@/db";
import { NextResponse } from "next/server";

// app/api/get-chats/route.ts
export async function GET(req: Request) {
  const userIdHeader = req.headers.get('X-User-ID');
  console.log('请求头中的用户ID:', userIdHeader);
  // 增强类型验证
  if (!userIdHeader?.match(/^\d+$/)) {
    return NextResponse.json(
      { error: '无效的用户凭证' }, 
      { status: 401 }
    );
  }

  try {
    const chats = await getChats(parseInt(userIdHeader));
    console.log('数据库查询结果:', chats); // 添加日志
    return NextResponse.json(chats);
  } catch (error) {
    console.error('数据库查询失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}