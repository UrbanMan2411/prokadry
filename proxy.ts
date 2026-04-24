import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAuthPage = pathname.startsWith('/auth');

  const token = req.cookies.get('prokadry_session')?.value;
  const session = token ? await decrypt(token) : null;

  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico)$).*)'],
};
