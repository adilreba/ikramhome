import { revalidatePath } from 'next/cache';
import { adminHandler, ok, readJson } from '@/lib/api';
import { cleanupImages, getSettings, saveSettings } from '@/lib/queries';
import { settingsSchema } from '@/lib/validation';
import { normalizePhone } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const GET = adminHandler(async () => ok(await getSettings()));

export const PUT = adminHandler(async (req) => {
  const body = settingsSchema.parse(await readJson(req));
  body.whatsapp_number = normalizePhone(body.whatsapp_number);
  const before = await getSettings();
  const saved = await saveSettings(body);
  // Değiştirilen eski logo / kapak görsellerini temizle
  const replaced = ['hero_image_id', 'logo_image_id'].map((k) => before[k]).filter((id) => id && !Object.values(saved).includes(id));
  await cleanupImages(replaced);
  revalidatePath('/', 'layout');
  return ok(saved);
});
