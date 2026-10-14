// .env.local / .env dosyalarını okuyup process.env'e yükler (ek paket gerektirmez)
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

export function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const p = path.resolve(process.cwd(), file);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m || line.trim().startsWith('#')) continue;
      let val = m[2];
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      if (process.env[m[1]] === undefined) process.env[m[1]] = val;
    }
  }
}

export function makeClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('✖ DATABASE_URL bulunamadı. .env.local dosyasını oluşturun (bkz. .env.example).');
    process.exit(1);
  }
  const isLocal = /localhost|127\.0\.0\.1|host=\/tmp/.test(url);
  return new pg.Client({ connectionString: url, ssl: isLocal ? false : { rejectUnauthorized: false } });
}
