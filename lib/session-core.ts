import { SignJWT, jwtVerify } from 'jose';

export type SessionPayload = {
  userId: string;
  email: string;
  role: 'EMPLOYER' | 'SEEKER' | 'ADMIN';
};

const TTL = 7 * 24 * 60 * 60 * 1000; // 7 days ms

function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function encryptToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getKey());
}

export async function decryptToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ['HS256'] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export function getSessionTtlMs() {
  return TTL;
}
