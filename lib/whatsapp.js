// WhatsApp mesajı oluşturma (tarayıcıda çalışır)
import { formatPrice, normalizePhone } from './utils';

export function buildCartMessage({ settings, items, inquiryId, customer = {}, origin }) {
  const cur = settings.currency || '₺';
  const lines = [];
  lines.push(settings.whatsapp_greeting || 'Merhaba, web sitenizden aşağıdaki ürünlerle ilgileniyorum:');
  lines.push('');
  if (inquiryId) lines.push(`🧾 Talep No: #${inquiryId}`, '');

  items.forEach((it, idx) => {
    lines.push(`*${idx + 1}) ${it.name}*`);
    if (it.color) {
      const barcodeNote = it.barcode ? ' (Barkod: ' + it.barcode + ')' : '';
      lines.push(`Renk: ${it.color}${barcodeNote}`);
    }
    lines.push(`Adet: ${it.qty} × ${formatPrice(it.price, cur)}${it.qty > 1 ? ` = ${formatPrice(it.qty * it.price, cur)}` : ''}`);
    if (it.slug) lines.push(`🔗 ${origin}/urun/${it.slug}`);
    if (it.image_id) lines.push(`📷 ${origin}/api/images/${it.image_id}`);
    lines.push('');
  });

  const total = items.reduce((s, i) => s + i.qty * Number(i.price), 0);
  lines.push(`*Toplam: ${formatPrice(total, cur)}*`);
  if (customer.name) lines.push(`Ad Soyad: ${customer.name}`);
  if (customer.note) lines.push(`Not: ${customer.note}`);
  return lines.join('\n');
}

export function waLink(number, text) {
  return `https://wa.me/${normalizePhone(number)}?text=${encodeURIComponent(text)}`;
}

// Talebi kaydeder, ardından WhatsApp'ı açar. Kayıt başarısız olsa bile WhatsApp açılır.
export async function sendToWhatsApp({ settings, items, customer = {} }) {
  const origin = window.location.origin;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  // Masaüstünde açılır pencere engellenmesin diye pencereyi hemen aç
  const popup = isMobile ? null : window.open('about:blank', '_blank');

  let inquiryId = null;
  try {
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: customer.name || null,
        customer_phone: customer.phone || null,
        note: customer.note || null,
        items: items.map((i) => ({ product_id: i.product_id, variant_id: i.variant_id || null, qty: i.qty })),
      }),
    });
    const json = await res.json();
    if (json.ok) {
      inquiryId = json.data.id;
      // Sunucudaki güncel fiyat/renk bilgisini kullan (ürün+renk eşleşmesiyle)
      const key = (i) => `${i.product_id}:${i.variant_id || 0}`;
      const fresh = new Map(json.data.items.map((i) => [key(i), i]));
      items = items.filter((i) => fresh.has(key(i))).map((i) => ({ ...i, ...fresh.get(key(i)) }));
    }
  } catch {}

  const url = waLink(settings.whatsapp_number, buildCartMessage({ settings, items, inquiryId, customer, origin }));
  if (popup && !popup.closed) popup.location.href = url;
  else window.location.href = url;
  return inquiryId;
}
