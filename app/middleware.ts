// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/api/:path*', '/chat/:path*']
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userId = request.cookies.get('user_id')?.value || '';
  
  // 调试日志
  console.log('====== 中间件执行 ======');
  console.log('路径:', pathname);
  console.log('用户ID:', userId);

  // 未登录拦截
  if (!userId && pathname.startsWith('/api')) {
    console.warn('拦截未授权API访问');
    return NextResponse.json(
      { code: 401, message: '请先登录' },
      { status: 401 }
    );
  }

  // 设置请求头
  const response = NextResponse.next();
  response.headers.set('x-user-id', userId);
  
  return response;
}