import { handler, ok } from '@/lib/api';
import { getSettings } from '@/lib/queries';

export const dynamic = 'force-dynamic';

// Herkese açık mağaza ayarları
export const GET = handler(async () => ok(await getSettings()));
