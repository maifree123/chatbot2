// middleware.ts 需要增加用户ID注入逻辑
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('===== 中间件被调用 =====');
  console.log('请求路径:', request.nextUrl.pathname);
  
  const userId = request.cookies.get('user_id')?.value || '';
  console.log('当前用户ID:', userId);

  const newHeaders = new Headers(request.headers);
  newHeaders.set('x-user-id', userId);
  
  return NextResponse.next({
    request: { headers: newHeaders }
  });
}