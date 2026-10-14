import { adminHandler, ok, readJson } from '@/lib/api';
import { createProduct, listProducts } from '@/lib/queries';
import { productSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

// GET /api/admin/products?q=&category=&status=all|active|inactive|out_of_stock&sort=&page=
export const GET = adminHandler(async (req) => {
  const sp = req.nextUrl.searchParams;
  const data = await listProducts({
    admin: true,
    q: sp.get('q') || '',
    category: sp.get('category'),
    status: sp.get('status') || 'all',
    sort: sp.get('sort') || 'new',
    page: sp.get('page') || 1,
    limit: sp.get('limit') || 20,
  });
  return ok(data);
});

// POST /api/admin/products
export const POST = adminHandler(async (req) => {
  const body = productSchema.parse(await readJson(req));
  const product = await createProduct(body);
  return ok(product, { status: 201 });
});
