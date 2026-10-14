// Hem sunucuda hem tarayıcıda kullanılabilen yardımcılar

const TR_MAP = { ç: 'c', ğ: 'g', ı: 'i', İ: 'i', ö: 'o', ş: 's', ü: 'u', Ç: 'c', Ğ: 'g', Ö: 'o', Ş: 's', Ü: 'u' };

export function slugify(text) {
  return String(text || '')
    .replace(/[çğıİöşüÇĞÖŞÜ]/g, (c) => TR_MAP[c] || c)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'urun';
}

export function formatPrice(value, currency = '₺') {
  const n = Number(value || 0);
  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
  return currency === '₺' ? `${formatted} ₺` : `${currency}${formatted}`;
}

export function imageUrl(id) {
  return id ? `/api/images/${id}` : null;
}

// Telefon numarasını wa.me formatına çevirir: "0532 123 45 67" → "905321234567"
export function normalizePhone(raw) {
  let d = String(raw || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('00')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = '90' + d.slice(1); // TR 0XXX
  if (d.length === 10 && d.startsWith('5')) d = '90' + d; // TR 5XX
  return d;
}

export function discountPercent(price, oldPrice) {
  const p = Number(price);
  const o = Number(oldPrice);
  if (!o || o <= p) return 0;
  return Math.round(((o - p) / o) * 100);
}

export function timeAgo(date) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'az önce';
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} gün önce`;
  return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const INQUIRY_STATUS = {
  new: { label: 'Yeni', cls: 'bg-clay-light text-clay-dark' },
  contacted: { label: 'Görüşülüyor', cls: 'bg-amber-100 text-amber-800' },
  sold: { label: 'Satıldı', cls: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'İptal', cls: 'bg-stone-200 text-stone-600' },
};
