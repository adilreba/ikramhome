import { adminHandler, ok, parseId, readJson } from '@/lib/api';
import { deleteCategory, updateCategory } from '@/lib/queries';
import { categorySchema } from '@/lib/validation';

export const PUT = adminHandler(async (req, { params }) => {
  const body = categorySchema.parse(await readJson(req));
  return ok(await updateCategory(parseId(params.id), body));
});

// Kategori silinince ürünleri silinmez, "kategorisiz" kalır.
export const DELETE = adminHandler(async (_req, { params }) => {
  return ok(await deleteCategory(parseId(params.id)));
});
