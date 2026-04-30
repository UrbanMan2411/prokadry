import { type NextRequest, NextResponse } from 'next/server';
import { exchangeHhCode } from '@/lib/parsers/hh';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const jar = await cookies();
  const savedState = jar.get('hh_oauth_state')?.value;
  jar.delete('hh_oauth_state');

  if (error) return NextResponse.redirect(new URL(`/dashboard?hh_error=${error}`, req.url));
  if (!code || state !== savedState) return NextResponse.redirect(new URL('/dashboard?hh_error=state_mismatch', req.url));

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/hh/callback`;

  try {
    const token = await exchangeHhCode(code, redirectUri);
    jar.set('hh_token', token.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: token.expires_in,
      path: '/',
    });
    jar.set('hh_refresh', token.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
  } catch (e) {
    console.error('[hh callback]', e);
    return NextResponse.redirect(new URL('/dashboard?hh_error=token_exchange', req.url));
  }

  return NextResponse.redirect(new URL('/dashboard?hh_connected=1', req.url));
}
