import { NextResponse } from 'next/server';
import { buildHhAuthUrl } from '@/lib/parsers/hh';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function GET() {
  const state = crypto.randomBytes(16).toString('hex');
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/hh/callback`;

  const jar = await cookies();
  jar.set('hh_oauth_state', state, { httpOnly: true, sameSite: 'lax', maxAge: 600 });

  return NextResponse.redirect(buildHhAuthUrl(redirectUri, state));
}
