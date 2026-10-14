import { z } from 'zod';
import { adminHandler, ok, readJson } from '@/lib/api';
import { query } from '@/lib/db';
import { cleanupImages } from '@/lib/queries';

const schema = z.object({
  ids: z.array(z.number().int().positive()).min(1, 'Ürün seçin.').max(200),
  action: z.enum(['activate', 'deactivate', 'feature', 'unfeature', 'delete', 'set_category']),
  category_id: z.number().int().positive().nullable().optional(),
});

// POST /api/admin/products/bulk  { ids: [...], action: "activate" | ... }
export const POST = adminHandler(async (req) => {
  const { ids, action, category_id } = schema.parse(await readJson(req));
  let affected = 0;
  if (action === 'delete') {
    const imgs = await query('SELECT image_id FROM product_images WHERE product_id = ANY($1::int[])', [ids]);
    const rows = await query('DELETE FROM products WHERE id = ANY($1::int[]) RETURNING id', [ids]);
    await cleanupImages(imgs.map((r) => r.image_id));
    affected = rows.length;
  } else {
    const sets = {
      activate: 'is_active = true',
      deactivate: 'is_active = false',
      feature: 'is_featured = true',
      unfeature: 'is_featured = false',
      set_category: 'category_id = $2',
    }[action];
    const params = action === 'set_category' ? [ids, category_id ?? null] : [ids];
    const rows = await query(`UPDATE products SET ${sets}, updated_at = now() WHERE id = ANY($1::int[]) RETURNING id`, params);
    affected = rows.length;
  }
  return ok({ affected });
});
