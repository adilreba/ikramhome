// Veri erişim katmanı: hem sayfalar (server components) hem API route'ları
// bu fonksiyonları kullanır; böylece site ve API her zaman aynı veriyi görür.
import { query, queryOne, transaction } from './db';
import { slugify } from './utils';
import { ApiError } from './api';

/* ----------------------------- AYARLAR ----------------------------- */

export const DEFAULT_SETTINGS = {
  store_name: 'Vitrin Butik',
  tagline: 'Özenle seçilmiş ürünler',
  whatsapp_number: '905000000000',
  whatsapp_greeting: 'Merhaba, web sitenizden aşağıdaki ürünlerle ilgileniyorum:',
  currency: '₺',
  hero_title: 'Zamansız parçalar, tek mesaj uzağınızda',
  hero_subtitle: 'Beğendiğiniz ürünleri sepete ekleyin, WhatsApp üzerinden bize gönderin; gerisini birlikte konuşalım.',
  hero_image_id: null,
  logo_image_id: null,
  announcement: 'Siparişleriniz WhatsApp üzerinden hızlıca onaylanır',
  about: '',
  address: '',
  phone: '',
  email: '',
  instagram: '',
  working_hours: 'Pzt – Cmt · 10:00 – 20:00',
  show_stock: false,
};

export async function getSettings() {
  const rows = await query('SELECT key, value FROM settings');
  const out = { ...DEFAULT_SETTINGS };
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export async function saveSettings(values) {
  await transaction(async (c) => {
    for (const [key, value] of Object.entries(values)) {
      await c.query(
        `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2::jsonb, now())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
        [key, JSON.stringify(value ?? null)]
      );
    }
  });
  return getSettings();
}

/* ---------------------------- KATEGORİLER ---------------------------- */

export async function listCategories({ includeInactive = false } = {}) {
  return query(
    `SELECT c.id, c.name, c.slug, c.description, c.image_id, c.sort_order, c.is_active,
            COUNT(p.id) FILTER (WHERE p.is_active)::int AS product_count,
            COUNT(p.id)::int AS total_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
      ${includeInactive ? '' : 'WHERE c.is_active'}
      GROUP BY c.id
      ORDER BY c.sort_order, c.name`
  );
}

export async function getCategoryBySlug(slug) {
  return queryOne('SELECT * FROM categories WHERE slug = $1 AND is_active', [slug]);
}

async function uniqueSlug(table, base, excludeId = null, client = null) {
  const run = client ? (t, p) => client.query(t, p).then((r) => r.rows) : query;
  const root = slugify(base);
  let candidate = root;
  for (let i = 2; i < 200; i++) {
    const rows = await run(`SELECT 1 FROM ${table} WHERE slug = $1 AND ($2::int IS NULL OR id <> $2) LIMIT 1`, [candidate, excludeId]);
    if (rows.length === 0) return candidate;
    candidate = `${root}-${i}`;
  }
  return `${root}-${Date.now()}`;
}

export async function createCategory(data) {
  const slug = await uniqueSlug('categories', data.slug || data.name);
  return queryOne(
    `INSERT INTO categories (name, slug, description, image_id, sort_order, is_active)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [data.name, slug, data.description ?? null, data.image_id ?? null, data.sort_order, data.is_active]
  );
}

export async function updateCategory(id, data) {
  const slug = await uniqueSlug('categories', data.slug || data.name, id);
  const row = await queryOne(
    `UPDATE categories SET name=$2, slug=$3, description=$4, image_id=$5, sort_order=$6, is_active=$7
      WHERE id=$1 RETURNING *`,
    [id, data.name, slug, data.description ?? null, data.image_id ?? null, data.sort_order, data.is_active]
  );
  if (!row) throw new ApiError(404, 'Kategori bulunamadı.');
  return row;
}

export async function deleteCategory(id) {
  const row = await queryOne('DELETE FROM categories WHERE id=$1 RETURNING id, image_id', [id]);
  if (!row) throw new ApiError(404, 'Kategori bulunamadı.');
  if (row.image_id) await cleanupImages([row.image_id]);
  return row;
}

/* ------------------------------ ÜRÜNLER ------------------------------ */

const PRODUCT_COLUMNS = `
  p.id, p.name, p.slug, p.description, p.sku, p.price, p.old_price, p.stock,
  p.category_id, p.is_active, p.is_featured, p.tags, p.views, p.created_at, p.updated_at,
  c.name AS category_name, c.slug AS category_slug,
  COALESCE(ARRAY(SELECT pi.image_id::text FROM product_images pi
                  WHERE pi.product_id = p.id ORDER BY pi.sort_order, pi.id), '{}') AS image_ids,
  COALESCE((SELECT jsonb_agg(jsonb_build_object(
                'id', pv.id, 'color', pv.color, 'barcode', pv.barcode,
                'stock', pv.stock, 'sort_order', pv.sort_order, 'is_active', pv.is_active
              ) ORDER BY pv.sort_order, pv.id)
              FROM product_variants pv WHERE pv.product_id = p.id), '[]'::jsonb) AS variants`;

// Tarihleri metne çevir (sunucudan istemci bileşenlerine güvenle aktarılabilsin)
const iso = (d) => (d instanceof Date ? d.toISOString() : d ?? null);

function mapProduct(r) {
  if (!r) return null;
  const { total_count, ...rest } = r;
  return {
    ...rest,
    price: Number(r.price),
    old_price: r.old_price === null ? null : Number(r.old_price),
    image_ids: r.image_ids || [],
    cover_image_id: (r.image_ids || [])[0] || null,
    variants: (r.variants || []).map((v) => ({ ...v, stock: Number(v.stock) })),
    created_at: iso(r.created_at),
    updated_at: iso(r.updated_at),
  };
}

const SORTS = {
  new: 'p.created_at DESC, p.id DESC',
  price_asc: 'p.price ASC, p.id DESC',
  price_desc: 'p.price DESC, p.id DESC',
  popular: 'p.views DESC, p.id DESC',
  name: 'p.name ASC',
  featured: 'p.is_featured DESC, p.created_at DESC',
};

/**
 * Ürün listesi.
 * @param {object} o
 * @param {boolean} o.admin  true ise pasif ürünler de listelenir
 */
export async function listProducts({
  q = '',
  category = null, // slug veya id
  featured = false,
  status = 'all', // admin: all | active | inactive | out_of_stock
  minPrice = null,
  maxPrice = null,
  sort = 'new',
  page = 1,
  limit = 24,
  admin = false,
} = {}) {
  const where = [];
  const params = [];
  const add = (v) => {
    params.push(v);
    return `$${params.length}`;
  };

  if (!admin) where.push('p.is_active', '(c.id IS NULL OR c.is_active)');
  if (admin && status === 'active') where.push('p.is_active');
  if (admin && status === 'inactive') where.push('NOT p.is_active');
  if (admin && status === 'out_of_stock') where.push('p.stock <= 0');
  if (featured) where.push('p.is_featured');
  if (q) {
    const term = add(`%${q.trim()}%`);
    where.push(`(p.name ILIKE ${term} OR p.description ILIKE ${term} OR p.sku ILIKE ${term} OR ${add(q.trim().toLowerCase())} = ANY(p.tags))`);
  }
  if (category) {
    if (/^\d+$/.test(String(category))) where.push(`p.category_id = ${add(Number(category))}`);
    else where.push(`c.slug = ${add(String(category))}`);
  }
  if (minPrice !== null && minPrice !== '' && !Number.isNaN(Number(minPrice))) where.push(`p.price >= ${add(Number(minPrice))}`);
  if (maxPrice !== null && maxPrice !== '' && !Number.isNaN(Number(maxPrice))) where.push(`p.price <= ${add(Number(maxPrice))}`);

  const safeLimit = Math.min(Math.max(Number(limit) || 24, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const orderBy = SORTS[sort] || SORTS.new;

  const rows = await query(
    `SELECT ${PRODUCT_COLUMNS}, COUNT(*) OVER()::int AS total_count
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY ${orderBy}
      LIMIT ${add(safeLimit)} OFFSET ${add((safePage - 1) * safeLimit)}`,
    params
  );

  const total = rows[0]?.total_count ?? 0;
  return {
    items: rows.map(mapProduct),
    total,
    page: safePage,
    limit: safeLimit,
    pages: Math.max(1, Math.ceil(total / safeLimit)),
  };
}

export async function getProductBySlug(slug) {
  const row = await queryOne(
    `SELECT ${PRODUCT_COLUMNS}
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.slug = $1 AND p.is_active`,
    [slug]
  );
  return mapProduct(row);
}

export async function getProductById(id) {
  const row = await queryOne(
    `SELECT ${PRODUCT_COLUMNS}
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = $1`,
    [id]
  );
  return mapProduct(row);
}

export async function getProductsByIds(ids) {
  if (!ids.length) return [];
  const rows = await query(
    `SELECT ${PRODUCT_COLUMNS}
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = ANY($1::int[]) AND p.is_active`,
    [ids]
  );
  return rows.map(mapProduct);
}

export async function getRelatedProducts(product, limit = 4) {
  const rows = await query(
    `SELECT ${PRODUCT_COLUMNS}
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.is_active AND p.id <> $1
      ORDER BY (p.category_id IS NOT DISTINCT FROM $2) DESC, p.is_featured DESC, p.created_at DESC
      LIMIT $3`,
    [product.id, product.category_id, limit]
  );
  return rows.map(mapProduct);
}

export async function incrementViews(id) {
  await query('UPDATE products SET views = views + 1 WHERE id = $1', [id]);
}

async function writeProductImages(client, productId, imageIds) {
  const before = await client.query('SELECT image_id FROM product_images WHERE product_id=$1', [productId]);
  await client.query('DELETE FROM product_images WHERE product_id=$1', [productId]);
  for (let i = 0; i < imageIds.length; i++) {
    await client.query('INSERT INTO product_images (product_id, image_id, sort_order) VALUES ($1,$2,$3)', [productId, imageIds[i], i]);
  }
  return before.rows.map((r) => r.image_id).filter((id) => !imageIds.includes(id));
}

async function writeProductVariants(client, productId, variants) {
  await client.query('DELETE FROM product_variants WHERE product_id=$1', [productId]);
  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    await client.query(
      `INSERT INTO product_variants (product_id, color, barcode, stock, sort_order)
       VALUES ($1,$2,$3,$4,$5)`,
      [productId, v.color, v.barcode || null, v.stock, i]
    );
  }
}

// Varyantlı ürünlerde toplam stok renklerin stoklarının toplamıdır
function resolveStock(data) {
  if (data.variants?.length) return data.variants.reduce((s, v) => s + Number(v.stock || 0), 0);
  return data.stock;
}

export async function createProduct(data) {
  const imageIds = [...new Set(data.image_ids)];
  const variants = data.variants || [];
  const stock = resolveStock(data);
  const id = await transaction(async (c) => {
    const slug = await uniqueSlug('products', data.slug || data.name, null, c);
    const { rows } = await c.query(
      `INSERT INTO products (name, slug, description, sku, price, old_price, stock, category_id, is_active, is_featured, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [data.name, slug, data.description ?? null, data.sku ?? null, data.price, data.old_price ?? null, stock,
       data.category_id ?? null, data.is_active, data.is_featured, data.tags.map((t) => t.toLowerCase())]
    );
    await writeProductImages(c, rows[0].id, imageIds);
    await writeProductVariants(c, rows[0].id, variants);
    return rows[0].id;
  });
  cleanupStaleUploads().catch(() => {});
  return getProductById(id);
}

export async function updateProduct(id, data) {
  const imageIds = [...new Set(data.image_ids)];
  const variants = data.variants || [];
  const stock = resolveStock(data);
  const removed = await transaction(async (c) => {
    const exists = await c.query('SELECT 1 FROM products WHERE id=$1 FOR UPDATE', [id]);
    if (!exists.rowCount) throw new ApiError(404, 'Ürün bulunamadı.');
    const slug = await uniqueSlug('products', data.slug || data.name, id, c);
    await c.query(
      `UPDATE products SET name=$2, slug=$3, description=$4, sku=$5, price=$6, old_price=$7, stock=$8,
              category_id=$9, is_active=$10, is_featured=$11, tags=$12, updated_at=now()
        WHERE id=$1`,
      [id, data.name, slug, data.description ?? null, data.sku ?? null, data.price, data.old_price ?? null, stock,
       data.category_id ?? null, data.is_active, data.is_featured, data.tags.map((t) => t.toLowerCase())]
    );
    await writeProductVariants(c, id, variants);
    return writeProductImages(c, id, imageIds);
  });
  if (removed.length) await cleanupImages(removed);
  return getProductById(id);
}

export async function patchProduct(id, patch) {
  const sets = [];
  const params = [id];
  for (const key of ['is_active', 'is_featured', 'stock', 'price']) {
    if (patch[key] !== undefined) {
      params.push(patch[key]);
      sets.push(`${key} = $${params.length}`);
    }
  }
  if (!sets.length) throw new ApiError(400, 'Güncellenecek alan yok.');
  const row = await queryOne(`UPDATE products SET ${sets.join(', ')}, updated_at=now() WHERE id=$1 RETURNING id`, params);
  if (!row) throw new ApiError(404, 'Ürün bulunamadı.');
  return getProductById(id);
}

export async function deleteProduct(id) {
  const imgs = await query('SELECT image_id FROM product_images WHERE product_id=$1', [id]);
  const row = await queryOne('DELETE FROM products WHERE id=$1 RETURNING id', [id]);
  if (!row) throw new ApiError(404, 'Ürün bulunamadı.');
  await cleanupImages(imgs.map((r) => r.image_id));
  return row;
}

export async function duplicateProduct(id) {
  const p = await getProductById(id);
  if (!p) throw new ApiError(404, 'Ürün bulunamadı.');
  return createProduct({
    ...p,
    name: `${p.name} (Kopya)`,
    slug: null,
    is_active: false,
    tags: p.tags || [],
    image_ids: p.image_ids,
    // Barkodlar benzersiz olmalı; kopyada boş bırakılır, yönetici yeniden girer
    variants: (p.variants || []).map((v) => ({ ...v, barcode: null })),
  });
}

/* ------------------------------ GÖRSELLER ----------------------------- */

const IMAGE_IN_USE = `
  EXISTS (SELECT 1 FROM product_images pi WHERE pi.image_id = i.id)
  OR EXISTS (SELECT 1 FROM categories c WHERE c.image_id = i.id)
  OR EXISTS (SELECT 1 FROM settings s WHERE s.value::text LIKE '%' || i.id::text || '%')`;

// Artık hiçbir yerde kullanılmayan görselleri siler
export async function cleanupImages(ids) {
  if (!ids?.length) return;
  await query(`DELETE FROM images i WHERE i.id = ANY($1::uuid[]) AND NOT (${IMAGE_IN_USE})`, [ids]);
}

// Yüklenip hiç kaydedilmemiş (24 saatten eski) görselleri temizler
export async function cleanupStaleUploads() {
  await query(`DELETE FROM images i WHERE i.created_at < now() - interval '24 hours' AND NOT (${IMAGE_IN_USE})`);
}

export async function saveImage({ buffer, mime, width = null, height = null }) {
  return queryOne(
    'INSERT INTO images (data, mime, size, width, height) VALUES ($1,$2,$3,$4,$5) RETURNING id, mime, size, width, height',
    [buffer, mime, buffer.length, width, height]
  );
}

export async function getImage(id) {
  return queryOne('SELECT data, mime, size FROM images WHERE id = $1', [id]);
}

/* ------------------------------ TALEPLER ----------------------------- */

export async function createInquiry(data) {
  // Aynı ürünün farklı renkleri ayrı satır olarak sayılır
  const lineKey = (it) => `${it.product_id}:${it.variant_id || 0}`;
  const lines = new Map();
  for (const it of data.items) {
    const key = lineKey(it);
    const cur = lines.get(key);
    lines.set(key, { product_id: it.product_id, variant_id: it.variant_id || null, qty: Math.min((cur?.qty || 0) + it.qty, 99) });
  }
  const products = await getProductsByIds([...new Set([...lines.values()].map((l) => l.product_id))]);
  const byId = new Map(products.map((p) => [p.id, p]));
  if (!products.length) throw new ApiError(422, 'Sepetteki ürünler artık satışta değil.');

  const items = [];
  for (const line of lines.values()) {
    const p = byId.get(line.product_id);
    if (!p) continue;
    const variant = line.variant_id ? (p.variants || []).find((v) => v.id === line.variant_id && v.is_active) : null;
    if (line.variant_id && !variant) continue; // renk artık yok/pasif
    items.push({
      product_id: p.id,
      variant_id: variant?.id ?? null,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      color: variant?.color ?? null,
      barcode: variant?.barcode ?? null,
      price: p.price,
      qty: line.qty,
      image_id: p.cover_image_id,
    });
  }
  if (!items.length) throw new ApiError(422, 'Sepetteki ürünler artık satışta değil.');
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  const row = await queryOne(
    `INSERT INTO inquiries (customer_name, customer_phone, note, items, item_count, total)
     VALUES ($1,$2,$3,$4::jsonb,$5,$6) RETURNING *`,
    [data.customer_name ?? null, data.customer_phone ?? null, data.note ?? null, JSON.stringify(items), count, total]
  );
  return mapInquiry(row);
}

function mapInquiry(r) {
  if (!r) return null;
  const { total_count, ...rest } = r;
  return { ...rest, total: Number(r.total), created_at: iso(r.created_at), updated_at: iso(r.updated_at) };
}

export async function listInquiries({ status = 'all', q = '', page = 1, limit = 20 } = {}) {
  const where = [];
  const params = [];
  const add = (v) => {
    params.push(v);
    return `$${params.length}`;
  };
  if (status && status !== 'all') where.push(`status = ${add(status)}`);
  if (q) {
    const t = add(`%${q.trim()}%`);
    where.push(`(customer_name ILIKE ${t} OR customer_phone ILIKE ${t} OR note ILIKE ${t} OR items::text ILIKE ${t} OR id::text = ${add(q.trim().replace('#', ''))})`);
  }
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const rows = await query(
    `SELECT *, COUNT(*) OVER()::int AS total_count FROM inquiries
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY created_at DESC
      LIMIT ${add(safeLimit)} OFFSET ${add((safePage - 1) * safeLimit)}`,
    params
  );
  const total = rows[0]?.total_count ?? 0;
  return { items: rows.map(mapInquiry), total, page: safePage, limit: safeLimit, pages: Math.max(1, Math.ceil(total / safeLimit)) };
}

export async function updateInquiry(id, patch) {
  const row = await queryOne(
    `UPDATE inquiries SET status = COALESCE($2, status),
            admin_note = CASE WHEN $3::boolean THEN $4 ELSE admin_note END,
            updated_at = now()
      WHERE id = $1 RETURNING *`,
    [id, patch.status ?? null, patch.admin_note !== undefined, patch.admin_note ?? null]
  );
  if (!row) throw new ApiError(404, 'Talep bulunamadı.');
  return mapInquiry(row);
}

export async function deleteInquiry(id) {
  const row = await queryOne('DELETE FROM inquiries WHERE id=$1 RETURNING id', [id]);
  if (!row) throw new ApiError(404, 'Talep bulunamadı.');
  return row;
}

/* ------------------------------ İSTATİSTİK ----------------------------- */

export async function getStats() {
  const [counts, inquiryCounts, daily, topViewed, topRequested, recent] = await Promise.all([
    queryOne(`SELECT
        COUNT(*)::int AS products,
        COUNT(*) FILTER (WHERE is_active)::int AS active_products,
        COUNT(*) FILTER (WHERE stock <= 0)::int AS out_of_stock,
        COALESCE(SUM(views),0)::int AS total_views,
        (SELECT COUNT(*)::int FROM categories) AS categories
      FROM products`),
    queryOne(`SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status='new')::int AS new,
        COUNT(*) FILTER (WHERE status='contacted')::int AS contacted,
        COUNT(*) FILTER (WHERE status='sold')::int AS sold,
        COALESCE(SUM(total) FILTER (WHERE status='sold'),0)::float AS sold_total,
        COUNT(*) FILTER (WHERE created_at > now() - interval '30 days')::int AS last30
      FROM inquiries`),
    query(`WITH today AS (SELECT (now() AT TIME ZONE $1)::date AS d)
      SELECT to_char(g::date, 'YYYY-MM-DD') AS day, COUNT(i.id)::int AS count
        FROM today, generate_series(today.d - 13, today.d, interval '1 day') g
        LEFT JOIN inquiries i ON (i.created_at AT TIME ZONE $1)::date = g::date
       GROUP BY g ORDER BY g`, [process.env.APP_TIMEZONE || 'Europe/Istanbul']),
    query(`SELECT p.id, p.name, p.views, p.price,
             (SELECT image_id::text FROM product_images WHERE product_id=p.id ORDER BY sort_order, id LIMIT 1) AS cover_image_id
        FROM products p ORDER BY p.views DESC LIMIT 5`),
    query(`SELECT (it->>'product_id')::int AS id, it->>'name' AS name,
             SUM((it->>'qty')::int)::int AS qty, COUNT(DISTINCT i.id)::int AS inquiries
        FROM inquiries i, jsonb_array_elements(i.items) it
       GROUP BY 1, 2 ORDER BY qty DESC LIMIT 5`),
    query(`SELECT id, customer_name, item_count, total, status, created_at FROM inquiries ORDER BY created_at DESC LIMIT 6`),
  ]);
  return {
    ...counts,
    inquiries: inquiryCounts,
    daily,
    top_viewed: topViewed.map((r) => ({ ...r, price: Number(r.price) })),
    top_requested: topRequested,
    recent: recent.map(mapInquiry),
  };
}
