import { ApiError, adminHandler, ok, readJson } from '@/lib/api';
import { checkPassword, hashPassword } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { passwordSchema } from '@/lib/validation';

// PUT /api/admin/password { current_password, new_password }
export const PUT = adminHandler(async (req, _ctx, admin) => {
  const { current_password, new_password } = passwordSchema.parse(await readJson(req));
  const row = await queryOne('SELECT password_hash FROM admin_users WHERE id = $1', [admin.id]);
  if (!row || !(await checkPassword(current_password, row.password_hash))) {
    throw new ApiError(422, 'Mevcut şifre hatalı.', { current_password: 'Mevcut şifre hatalı.' });
  }
  await query('UPDATE admin_users SET password_hash = $2 WHERE id = $1', [admin.id, await hashPassword(new_password)]);
  return ok(true);
});
