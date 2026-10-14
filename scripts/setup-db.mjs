// Kullanım: npm run db:setup — veritabanı tablolarını oluşturur/günceller.
// Admin girişi Clerk üzerinden yönetilir, buradan kullanıcı oluşturulmaz.
import fs from 'node:fs';
import path from 'node:path';
import { loadEnv, makeClient } from './_env.mjs';

loadEnv();
const client = makeClient();

try {
  await client.connect();
  console.log('→ Veritabanına bağlanıldı');

  const schema = fs.readFileSync(path.resolve(process.cwd(), 'db/schema.sql'), 'utf8');
  await client.query(schema);
  console.log('✔ Tablolar hazır');

  console.log('\nKurulum tamam. Şimdi "npm run dev" ile siteyi başlatabilirsiniz.');
} catch (err) {
  console.error('✖ Kurulum hatası:', err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
