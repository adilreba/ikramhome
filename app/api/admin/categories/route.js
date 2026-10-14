import { adminHandler, ok, readJson } from '@/lib/api';
import { createCategory, listCategories } from '@/lib/queries';
import { categorySchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = adminHandler(async () => ok(await listCategories({ includeInactive: true })));

export const POST = adminHandler(async (req) => {
  const body = categorySchema.parse(await readJson(req));
  return ok(await createCategory(body), { status: 201 });
});
