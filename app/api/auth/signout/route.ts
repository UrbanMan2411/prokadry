import { NextResponse } from 'next/server';

const COOKIE = 'prokadry_session';

export async function GET() {
  const response = new NextResponse(null, {
    status: 302,
    headers: { Location: '/auth' },
  });
  response.cookies.set(COOKIE, '', { maxAge: 0, path: '/' });
  return response;
}
