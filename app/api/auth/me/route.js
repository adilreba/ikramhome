import { fail, handler, ok } from '@/lib/api';
import { getAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const GET = handler(async () => {
  const admin = await getAdmin();
  return admin ? ok(admin) : fail(401, 'Giriş yapılmadı.');
});
