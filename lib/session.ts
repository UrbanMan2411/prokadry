import { cookies } from 'next/headers';
import 'server-only';
import { decryptToken, encryptToken, getSessionTtlMs, type SessionPayload } from './session-core';

const COOKIE = 'prokadry_session';

export async function createSession(payload: SessionPayload) {
  const token = await encryptToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(Date.now() + getSessionTtlMs()),
    path: '/',
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  return decryptToken(token);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}
