import { Pool } from 'pg';

// Neon ile uyumlu tek bir bağlantı havuzu. Geliştirme modunda (hot reload)
// her dosya değişikliğinde yeni havuz açılmasın diye global'de saklanır.
const globalForDb = globalThis;

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL tanımlı değil. .env.local dosyanızı kontrol edin.');
  }
  const isLocal = /localhost|127\.0\.0\.1|host=\/tmp/.test(connectionString);
  return new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: Number(process.env.DB_POOL_MAX || 5),
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 15_000,
  });
}

export function getPool() {
  if (!globalForDb.__vitrinPool) globalForDb.__vitrinPool = createPool();
  return globalForDb.__vitrinPool;
}

export async function query(text, params = []) {
  const res = await getPool().query(text, params);
  return res.rows;
}

export async function queryOne(text, params = []) {
  const rows = await query(text, params);
  return rows[0] || null;
}

// Birden fazla sorguyu tek işlemde (transaction) çalıştırır.
export async function transaction(fn) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
