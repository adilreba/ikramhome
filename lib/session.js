// Edge (middleware) ve Node ortamında çalışan oturum yardımcıları.
// Sadece `jose` kullanır; veritabanına dokunmaz.
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'vitrin_admin';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 gün

function getKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET en az 32 karakter olmalı.');
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getKey());
}

export async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey());
    return payload;
  } catch {
    return null;
  }
}
