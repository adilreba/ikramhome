import { ApiError, handler, ok } from '@/lib/api';
import { getProductBySlug, getRelatedProducts } from '@/lib/queries';

export const dynamic = 'force-dynamic';

// GET /api/products/:slug  → ürün detayı + benzer ürünler
export const GET = handler(async (_req, { params }) => {
  const product = await getProductBySlug(params.slug);
  if (!product) throw new ApiError(404, 'Ürün bulunamadı.');
  const related = await getRelatedProducts(product);
  return ok({ product, related });
});
