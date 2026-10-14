import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isApiAdminRoute = createRouteMatcher(['/api/admin(.*)']);
const isAdminPageRoute = createRouteMatcher(['/admin(.*)']);
const isLoginRoute = createRouteMatcher(['/admin/login(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isApiAdminRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Oturum süresi doldu. Lütfen tekrar giriş yapın.' }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (isAdminPageRoute(req) && !isLoginRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
