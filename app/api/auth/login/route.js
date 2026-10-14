import { ApiError, handler, ok, readJson } from '@/lib/api';
import { checkPassword, createSessionCookie } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { loginSchema } from '@/lib/validation';

// Kaba kuvvet denemelerine karşı: aynı IP'den 15 dakikada 10 hatalı deneme
const attempts = new Map();

export const POST = handler(async (req) => {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((t) => now - t < 15 * 60_000);
  if (recent.length >= 10) throw new ApiError(429, 'Çok fazla hatalı deneme. 15 dakika sonra tekrar deneyin.');

  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
    throw new ApiError(500, 'Sunucu yapılandırması eksik: AUTH_SECRET en az 32 karakter olmalı.');
  }

  const { email, password } = loginSchema.parse(await readJson(req));
  const user = await queryOne('SELECT id, email, name, password_hash FROM admin_users WHERE email = $1', [email]);
  const valid = user ? await checkPassword(password, user.password_hash) : false;

  if (!valid) {
    recent.push(now);
    attempts.set(ip, recent);
    throw new ApiError(401, 'E-posta veya şifre hatalı.');
  }

  attempts.delete(ip);
  await query('UPDATE admin_users SET last_login_at = now() WHERE id = $1', [user.id]);
  await createSessionCookie(user);
  return ok({ id: user.id, email: user.email, name: user.name });
});
