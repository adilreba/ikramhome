// Kullanım: npm run db:seed
// Siteyi denemek için örnek kategori ve ürünler ekler (görseller basit çizimlerdir).
// Gerçek ürünlerinizi eklemeye başlamadan önce admin panelinden silebilirsiniz.
import { loadEnv, makeClient } from './_env.mjs';

loadEnv();
const client = makeClient();

const palettes = [
  ['#E9DCCB', '#B5603A'], ['#DDE3D6', '#5E7151'], ['#E6DDE3', '#7C5A6E'],
  ['#D9E1E6', '#46647A'], ['#EFE3CF', '#A27B3A'], ['#E3DAD2', '#5B4A3F'],
];
const shapes = [
  (c) => `<circle cx="300" cy="330" r="150" fill="${c}"/><rect x="230" y="120" width="140" height="70" rx="20" fill="${c}" opacity=".7"/>`,
  (c) => `<path d="M170 520 Q300 120 430 520 Z" fill="${c}"/><circle cx="300" cy="200" r="34" fill="${c}" opacity=".6"/>`,
  (c) => `<rect x="160" y="170" width="280" height="330" rx="28" fill="${c}"/><rect x="250" y="120" width="100" height="60" rx="14" fill="${c}" opacity=".6"/>`,
  (c) => `<ellipse cx="300" cy="360" rx="170" ry="120" fill="${c}"/><ellipse cx="300" cy="250" rx="90" ry="60" fill="${c}" opacity=".55"/>`,
];

function svg(i, j) {
  const [bg, fg] = palettes[(i + j) % palettes.length];
  const shape = shapes[(i * 3 + j) % shapes.length](fg);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750"><rect width="600" height="750" fill="${bg}"/>${shape}<rect x="0" y="640" width="600" height="110" fill="${fg}" opacity=".08"/></svg>`
  );
}

const categories = [
  ['Seramik', 'seramik', 'El yapımı kupalar, tabaklar ve vazolar'],
  ['Tekstil', 'tekstil', 'Keten örtüler, yastıklar ve şallar'],
  ['Aydınlatma', 'aydinlatma', 'Masa lambaları ve mumluklar'],
  ['Aksesuar', 'aksesuar', 'Günlük kullanım için küçük dokunuşlar'],
];

const products = [
  ['El Yapımı Seramik Kupa', 0, 450, 550, true, 'Tornada şekillendirilmiş, sırlı stoneware kupa. 350 ml.'],
  ['Mat Toprak Vazo', 0, 890, null, true, 'Kuru çiçekler için ideal, mat dokulu toprak vazo. 24 cm.'],
  ['Servis Tabağı Seti (4 lü)', 0, 1450, 1690, false, 'Günlük kullanıma uygun, bulaşık makinesinde yıkanabilir.'],
  ['Keten Masa Örtüsü', 1, 1290, null, true, '%100 yıkanmış keten, 150x220 cm.'],
  ['Pamuklu Kırlent Kılıfı', 1, 390, 480, false, 'Gizli fermuarlı, 45x45 cm.'],
  ['Örgü Battaniye', 1, 1850, null, false, 'Yumuşak dokulu, koltuk ve yatak için.'],
  ['Pirinç Masa Lambası', 2, 2750, 3100, true, 'Fırçalanmış pirinç gövde, keten abajur.'],
  ['Cam Mumluk', 2, 320, null, false, 'El üfleme cam, tealight uyumlu.'],
  ['Deri Anahtarlık', 3, 260, null, false, 'Bitkisel tabaklanmış deri.'],
  ['Ahşap Tepsi', 3, 740, 820, true, 'Ceviz ağacından oyma servis tepsisi.'],
  ['Bambu Sepet', 3, 560, null, false, 'Depolama ve dekorasyon için çok amaçlı.'],
  ['Tütsü Seti', 3, 310, null, false, 'Doğal içerikli, 20 çubuk + seramik altlık.'],
];

const slugify = (s) =>
  s.toLowerCase().replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

try {
  await client.connect();
  await client.query('BEGIN');
  const catIds = [];
  for (const [i, [name, slug, desc]] of categories.entries()) {
    const { rows } = await client.query(
      `INSERT INTO categories (name, slug, description, sort_order) VALUES ($1,$2,$3,$4)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
      [name, slug, desc, i]
    );
    catIds.push(rows[0].id);
  }
  let added = 0;
  for (const [i, [name, cat, price, old, featured, desc]] of products.entries()) {
    const slug = slugify(name);
    const exists = await client.query('SELECT 1 FROM products WHERE slug=$1', [slug]);
    if (exists.rowCount) continue;
    const { rows } = await client.query(
      `INSERT INTO products (name, slug, description, sku, price, old_price, stock, category_id, is_featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [name, slug, desc, `VB-${String(100 + i)}`, price, old, 3 + (i % 7), catIds[cat], featured]
    );
    for (let j = 0; j < 3; j++) {
      const buf = svg(i, j);
      const img = await client.query('INSERT INTO images (data, mime, size, width, height) VALUES ($1,$2,$3,600,750) RETURNING id', [buf, 'image/svg+xml', buf.length]);
      await client.query('INSERT INTO product_images (product_id, image_id, sort_order) VALUES ($1,$2,$3)', [rows[0].id, img.rows[0].id, j]);
    }
    added++;
  }
  await client.query('COMMIT');
  console.log(`✔ ${categories.length} kategori ve ${added} örnek ürün eklendi.`);
} catch (err) {
  await client.query('ROLLBACK').catch(() => {});
  console.error('✖ Hata:', err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
