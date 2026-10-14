import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { queryOne } from './db';
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from './session';

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function checkPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function createSessionCookie(user) {
  const token = await signSession({ sub: String(user.id), email: user.email, name: user.name });
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookie() {
  cookies().set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

// Oturumdaki yöneticiyi döndürür (yoksa null). Kullanıcı silinmişse de null.
export async function getAdmin() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const payload = await verifySession(token);
  if (!payload?.sub) return null;
  return queryOne('SELECT id, email, name FROM admin_users WHERE id = $1', [Number(payload.sub)]);
}
