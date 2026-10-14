import { ApiError, adminHandler, ok, parseId, readJson } from '@/lib/api';
import { deleteProduct, getProductById, patchProduct, updateProduct } from '@/lib/queries';
import { productPatchSchema, productSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = adminHandler(async (_req, { params }) => {
  const product = await getProductById(parseId(params.id));
  if (!product) throw new ApiError(404, 'Ürün bulunamadı.');
  return ok(product);
});

// PUT → tüm alanları günceller
export const PUT = adminHandler(async (req, { params }) => {
  const body = productSchema.parse(await readJson(req));
  return ok(await updateProduct(parseId(params.id), body));
});

// PATCH → hızlı güncelleme (aktif/pasif, öne çıkan, stok, fiyat)
export const PATCH = adminHandler(async (req, { params }) => {
  const body = productPatchSchema.parse(await readJson(req));
  return ok(await patchProduct(parseId(params.id), body));
});

export const DELETE = adminHandler(async (_req, { params }) => {
  return ok(await deleteProduct(parseId(params.id)));
});
