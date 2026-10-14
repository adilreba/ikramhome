import { adminHandler, ok, parseId } from '@/lib/api';
import { duplicateProduct } from '@/lib/queries';

// POST /api/admin/products/:id/duplicate → ürünü (pasif olarak) kopyalar
export const POST = adminHandler(async (_req, { params }) => {
  return ok(await duplicateProduct(parseId(params.id)), { status: 201 });
});
