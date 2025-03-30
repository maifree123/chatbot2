import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { deleteUser } from '@/db';

export async function DELETE(req: NextRequest) {
  // 从 headers 获取用户ID
  const userId = req.headers.get('X-User-ID');

  // 验证用户ID
  if (!userId) {
    return NextResponse.json(
      { message: '缺少用户ID' },
      { status: 400 }
    );
  }

  // 权限校验（示例）
  // const sessionUserId = getSessionUserId(); // 需实现会话管理
  // if (parseInt(userId) !== sessionUserId) {
  //   return NextResponse.json(
  //     { message: '无权操作' }, 
  //     { status: 403 }
  //   );
  // }

  try {
    await deleteUser(parseInt(userId));
    return NextResponse.json(
      { message: '账户已永久删除' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

// 明确声明支持的方法
export const dynamic = 'force-dynamic';