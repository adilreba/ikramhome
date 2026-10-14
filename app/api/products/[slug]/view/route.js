import { handler, ok } from '@/lib/api';
import { queryOne } from '@/lib/db';

// POST /api/products/:slug/view → görüntülenme sayacını 1 artırır
export const POST = handler(async (_req, { params }) => {
  const row = await queryOne('UPDATE products SET views = views + 1 WHERE slug = $1 AND is_active RETURNING views', [params.slug]);
  return ok({ views: row?.views ?? 0 });
});
