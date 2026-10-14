import { adminHandler, ok } from '@/lib/api';
import { getStats } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const GET = adminHandler(async () => ok(await getStats()));
