import { NextRequest, NextResponse } from 'next/server';
import { decryptToken } from '@/lib/session-core';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAuthPage = pathname.startsWith('/auth');
  const isDashboard = pathname.startsWith('/dashboard');

  const token = req.cookies.get('prokadry_session')?.value;
  const session = token ? await decryptToken(token) : null;

  // Protect dashboard — redirect to login if no session
  if (isDashboard && !session) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  // Redirect logged-in users away from auth page and landing to dashboard
  if (session && (isAuthPage || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico)$).*)'],
};
