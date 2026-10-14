import { ApiError, adminHandler, ok } from '@/lib/api';
import { saveImage } from '@/lib/queries';
import { imageUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB (Vercel istek sınırı 4.5 MB)

// Dosyanın gerçekten görsel olduğunu ilk baytlarından anlar (uzantıya güvenmez)
function sniffMime(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (buf.toString('ascii', 0, 3) === 'GIF') return 'image/gif';
  if (buf.toString('ascii', 4, 12) === 'ftypavif') return 'image/avif';
  return null;
}

// POST /api/admin/upload  (multipart/form-data, alan adı: "files", birden çok olabilir)
export const POST = adminHandler(async (req) => {
  let form;
  try {
    form = await req.formData();
  } catch {
    throw new ApiError(400, 'Dosya okunamadı.');
  }
  const files = form.getAll('files').filter((f) => typeof f === 'object' && 'arrayBuffer' in f);
  if (!files.length) throw new ApiError(400, 'Yüklenecek dosya bulunamadı.');
  if (files.length > 12) throw new ApiError(400, 'Tek seferde en fazla 12 dosya yükleyebilirsiniz.');

  const dims = String(form.get('dims') || '').split(';'); // "w x h" listesi (istemci gönderir)
  const saved = [];
  for (let i = 0; i < files.length; i++) {
    const buffer = Buffer.from(await files[i].arrayBuffer());
    if (buffer.length > MAX_BYTES) throw new ApiError(413, `"${files[i].name}" 4 MB'tan büyük.`);
    const mime = sniffMime(buffer);
    if (!mime) throw new ApiError(415, `"${files[i].name}" desteklenen bir görsel değil (JPG, PNG, WEBP, GIF).`);
    const [w, h] = (dims[i] || '').split('x').map((n) => Number(n) || null);
    const img = await saveImage({ buffer, mime, width: w ?? null, height: h ?? null });
    saved.push({ ...img, url: imageUrl(img.id) });
  }
  return ok(saved, { status: 201 });
});
