import { handler, ok } from '@/lib/api';
import { listProducts } from '@/lib/queries';

export const dynamic = 'force-dynamic';

// GET /api/products?q=&category=&featured=1&sort=new|price_asc|price_desc|popular&page=1&limit=24&min=&max=
export const GET = handler(async (req) => {
  const sp = req.nextUrl.searchParams;
  const data = await listProducts({
    q: sp.get('q') || '',
    category: sp.get('category'),
    featured: sp.get('featured') === '1',
    sort: sp.get('sort') || 'new',
    page: sp.get('page') || 1,
    limit: sp.get('limit') || 24,
    minPrice: sp.get('min'),
    maxPrice: sp.get('max'),
  });
  return ok(data);
});
