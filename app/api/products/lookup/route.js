import { handler, ok } from '@/lib/api';
import { getProductsByIds } from '@/lib/queries';

export const dynamic = 'force-dynamic';

// GET /api/products/lookup?ids=1,2,3
// Sepetteki ürünlerin güncel fiyat / stok / görsel bilgisini döndürür.
export const GET = handler(async (req) => {
  const ids = (req.nextUrl.searchParams.get('ids') || '')
    .split(',')
    .map((s) => Number(s))
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 100);
  const items = await getProductsByIds(ids);
  return ok(items);
});
