// Kullanım: npm run db:setup
// 1) Tabloları oluşturur  2) İlk yönetici hesabını ekler / şifresini günceller
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { loadEnv, makeClient } from './_env.mjs';

loadEnv();
const client = makeClient();

try {
  await client.connect();
  console.log('→ Veritabanına bağlanıldı');

  const schema = fs.readFileSync(path.resolve(process.cwd(), 'db/schema.sql'), 'utf8');
  await client.query(schema);
  console.log('✔ Tablolar hazır');

  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  if (!email || password.length < 8) {
    console.warn('! ADMIN_EMAIL ve en az 8 karakterlik ADMIN_PASSWORD tanımlanmadığı için yönetici oluşturulmadı.');
  } else {
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await client.query(
      `INSERT INTO admin_users (email, name, password_hash) VALUES ($1, 'Yönetici', $2)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING (xmax = 0) AS created`,
      [email, hash]
    );
    console.log(rows[0].created ? `✔ Yönetici oluşturuldu: ${email}` : `✔ Yönetici şifresi güncellendi: ${email}`);
  }
  console.log('\nKurulum tamam. Şimdi "npm run dev" ile siteyi başlatabilirsiniz.');
} catch (err) {
  console.error('✖ Kurulum hatası:', err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
