import { getImage } from '@/lib/queries';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/images/:id → veritabanındaki görseli döndürür (uzun süre önbelleğe alınır)
export async function GET(_req, { params }) {
  const id = String(params.id || '').replace(/\.(webp|jpe?g|png|gif|svg)$/i, '');
  if (!UUID_RE.test(id)) return new Response('Bulunamadı', { status: 404 });
  try {
    const img = await getImage(id);
    if (!img) return new Response('Bulunamadı', { status: 404 });
    return new Response(img.data, {
      headers: {
        'Content-Type': img.mime,
        'Content-Length': String(img.size),
        // Görsel kimlikleri değişmez → tarayıcı ve CDN 1 yıl saklayabilir
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
        ...(img.mime === 'image/svg+xml' ? { 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'" } : {}),
      },
    });
  } catch (err) {
    console.error('[images]', err);
    return new Response('Sunucu hatası', { status: 500 });
  }
}
