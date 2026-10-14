import { ApiError, handler, ok, readJson } from '@/lib/api';
import { createInquiry } from '@/lib/queries';
import { inquirySchema } from '@/lib/validation';

// Basit hız sınırı: aynı IP'den dakikada en fazla 10 talep
const hits = new Map();
function rateLimit(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  if (list.length >= 10) return false;
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return true;
}

// POST /api/inquiries  { items: [{product_id, qty}], customer_name?, customer_phone?, note? }
// Fiyatlar sunucuda veritabanından yeniden hesaplanır; istemciye güvenilmez.
export const POST = handler(async (req) => {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
  if (!rateLimit(ip)) throw new ApiError(429, 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.');
  const body = inquirySchema.parse(await readJson(req));
  const inquiry = await createInquiry(body);
  return ok(inquiry, { status: 201 });
});
