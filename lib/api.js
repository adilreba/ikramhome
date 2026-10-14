import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getAdmin } from './auth';

// Tüm API cevapları aynı biçimdedir:
//   başarılı → { ok: true, data: ... }
//   hatalı   → { ok: false, error: "mesaj", fields?: { alan: "mesaj" } }

export class ApiError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export function ok(data, init = {}) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(status, error, fields) {
  return NextResponse.json({ ok: false, error, ...(fields ? { fields } : {}) }, { status });
}

function handleError(err) {
  if (err instanceof ApiError) return fail(err.status, err.message, err.fields);
  if (err instanceof ZodError) {
    const fields = {};
    for (const issue of err.issues) fields[issue.path.join('.') || '_'] = issue.message;
    return fail(422, 'Lütfen formu kontrol edin.', fields);
  }
  // PostgreSQL hata kodları
  if (err?.code === '23505') return fail(409, 'Bu kayıt zaten mevcut (benzersiz alan çakışması).');
  if (err?.code === '23503') return fail(409, 'İlişkili kayıt bulunamadı veya kullanımda.');
  if (err?.code === '22P02') return fail(400, 'Geçersiz parametre.');
  console.error('[API]', err);
  return fail(500, 'Sunucu hatası. Lütfen tekrar deneyin.');
}

// Herkese açık uç noktalar için sarmalayıcı
export function handler(fn) {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      return handleError(err);
    }
  };
}

// Sadece giriş yapmış yöneticiler için sarmalayıcı
export function adminHandler(fn) {
  return async (req, ctx) => {
    try {
      const admin = await getAdmin();
      if (!admin) return fail(401, 'Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      return await fn(req, ctx, admin);
    } catch (err) {
      return handleError(err);
    }
  };
}

export async function readJson(req) {
  try {
    return await req.json();
  } catch {
    throw new ApiError(400, 'Geçersiz JSON gövdesi.');
  }
}

export function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new ApiError(400, 'Geçersiz kimlik.');
  return id;
}
