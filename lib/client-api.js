// Admin paneli için tarayıcı tarafı API istemcisi.
// Sunucunun { ok, data, error, fields } biçimini tek yerden çözer.

export class ClientApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.status = status;
    this.fields = fields || {};
  }
}

export async function api(url, { method = 'GET', body, form } = {}) {
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
      cache: 'no-store',
    });
  } catch {
    throw new ClientApiError('Bağlantı hatası. İnternetinizi kontrol edin.', 0);
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    // JSON olmayan cevap (ör. platform hata sayfası)
  }

  if (res.status === 401 && typeof window !== 'undefined' && url.startsWith('/api/admin')) {
    window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    throw new ClientApiError('Oturum süresi doldu.', 401);
  }
  if (!res.ok || !json?.ok) {
    throw new ClientApiError(json?.error || `İstek başarısız (${res.status}).`, res.status, json?.fields);
  }
  return json.data;
}

// Görseli tarayıcıda küçültür (en uzun kenar 1600px, JPEG %85) → hızlı yükleme, az veritabanı alanı
export async function compressImage(file, { maxSize = 1600, quality = 0.85 } = {}) {
  if (file.type === 'image/gif') return { blob: file, width: null, height: null };
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      throw new Error(`"${file.name}" okunamadı. JPG, PNG veya WEBP yükleyin (iPhone HEIC ise önce JPG'ye çevirin).`);
    }
  }
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  if (!blob) throw new Error(`"${file.name}" dönüştürülemedi.`);
  return { blob, width: w, height: h };
}

// Her dosya ayrı istekle (en fazla 3 paralel) yüklenir; böylece sunucu boyut sınırına takılmaz.
// Sonuç, seçilen dosya sırasıyla döner.
export async function uploadImages(files, onProgress) {
  const list = Array.from(files);
  const results = new Array(list.length);
  let done = 0;
  let cursor = 0;
  const worker = async () => {
    while (cursor < list.length) {
      const idx = cursor++;
      const file = list[idx];
      const { blob, width, height } = await compressImage(file);
      const form = new FormData();
      form.append('files', blob, file.name.replace(/\.[^.]+$/, '') + (blob.type === 'image/gif' ? '.gif' : '.jpg'));
      form.append('dims', width && height ? `${width}x${height}` : '');
      const [saved] = await api('/api/admin/upload', { method: 'POST', form });
      results[idx] = saved;
      onProgress?.(++done / list.length);
    }
  };
  await Promise.all(Array.from({ length: Math.min(3, list.length) }, worker));
  return results;
}
