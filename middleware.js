import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from './lib/session';

// /admin sayfalarını ve /api/admin uç noktalarını korur.
export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === '/admin/login';
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  if (pathname.startsWith('/api/admin')) {
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Oturum süresi doldu. Lütfen tekrar giriş yapın.' }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (isLoginPage) {
    if (session) return NextResponse.redirect(new URL('/admin', req.url));
    return NextResponse.next();
  }

  if (!session) {
    const url = new URL('/admin/login', req.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
