import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // API 라우트는 미들웨어에서 제외
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 인증이 필요한 페이지들
  const protectedPaths = ['/', '/ai-zones', '/analytics', '/history', '/settings'];

  // 인증 페이지들 (인증된 사용자는 접근 불가)
  const authPaths = ['/auth/login', '/auth/register'];

  const isAuthenticated = !!req.auth;
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));
  // 보호된 경로에 미인증 사용자가 접근하려 할 때
  if (isProtectedPath && !isAuthenticated && !isAuthPath) {
    console.log('보호된 경로에 미인증 사용자가 접근하려 할 때', pathname, isAuthPath);
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 인증된 사용자가 로그인 페이지에 접근하려 할 때
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};

// NextAuth + Prisma 조합을 위해 Node.js 런타임 사용
export const runtime = 'nodejs';
