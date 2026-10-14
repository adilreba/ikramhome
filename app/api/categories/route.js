import { handler, ok } from '@/lib/api';
import { listCategories } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const GET = handler(async () => ok(await listCategories()));
