import { handler, ok } from '@/lib/api';
import { clearSessionCookie } from '@/lib/auth';

export const POST = handler(async () => {
  clearSessionCookie();
  return ok(true);
});
