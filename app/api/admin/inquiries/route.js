import { adminHandler, ok } from '@/lib/api';
import { listInquiries } from '@/lib/queries';

export const dynamic = 'force-dynamic';

// GET /api/admin/inquiries?status=all|new|contacted|sold|cancelled&q=&page=
export const GET = adminHandler(async (req) => {
  const sp = req.nextUrl.searchParams;
  return ok(
    await listInquiries({
      status: sp.get('status') || 'all',
      q: sp.get('q') || '',
      page: sp.get('page') || 1,
      limit: sp.get('limit') || 20,
    })
  );
});
