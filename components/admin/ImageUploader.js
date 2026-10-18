'use client';

import { useRef, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon, ImageIcon, UploadIcon } from '@/components/Icons';
import { uploadImages } from '@/lib/client-api';
import { imageUrl } from '@/lib/utils';
import { useAdminUI } from './AdminUI';

/**
 * Çoklu fotoğraf yükleme + sürükle-bırak ile sıralama.
 * İlk fotoğraf ürünün kapak fotoğrafıdır (WhatsApp mesajında da bu gider).
 */
export default function ImageUploader({ value = [], onChange, max = 12, single = false, compact = false }) {
  const inputRef = useRef(null);
  const { notify } = useAdminUI();
  const [progress, setProgress] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name));
    if (!files.length) return;
    const room = single ? 1 : max - value.length;
    if (room <= 0) return notify(`En fazla ${max} fotoğraf ekleyebilirsiniz.`, 'error');
    const batch = files.slice(0, room);
    setProgress(0);
    try {
      const saved = await uploadImages(batch, setProgress);
      const ids = saved.map((s) => s.id);
      onChange(single ? ids.slice(0, 1) : [...value, ...ids]);
      notify(`${ids.length} fotoğraf yüklendi`);
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const move = (from, to) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const removeAt = (i) => onChange(value.filter((_, idx) => idx !== i));

  const dropZone = (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); if (dragIndex === null) handleFiles(e.dataTransfer.files); }}
      disabled={progress !== null}
      className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-center text-xs transition ${compact ? 'aspect-square gap-1 p-1' : 'aspect-[4/5]'} ${
        dragOver ? 'border-clay bg-clay-light/40 text-clay-dark' : 'border-cream-line text-ink-mute hover:border-ink/30 hover:text-ink'
      }`}
    >
      {progress !== null ? (
        compact ? (
          <span className="text-[10px] font-semibold tabular-nums">%{Math.round(progress * 100)}</span>
        ) : (
          <>
            <span className="text-sm font-semibold tabular-nums">%{Math.round(progress * 100)}</span>
            <span className="h-1 w-2/3 overflow-hidden rounded-full bg-cream-line">
              <span className="block h-full bg-clay transition-all" style={{ width: `${progress * 100}%` }} />
            </span>
            <span>Yükleniyor…</span>
          </>
        )
      ) : compact ? (
        <UploadIcon className="h-4 w-4" />
      ) : (
        <>
          <UploadIcon className="h-6 w-6" />
          <span className="px-2 font-semibold">{single ? 'Görsel seç' : 'Fotoğraf ekle'}</span>
          <span className="px-2">veya sürükleyip bırakın</span>
        </>
      )}
    </button>
  );

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" multiple={!single} hidden onChange={(e) => handleFiles(e.target.files)} />
      <div className={`grid gap-3 ${single ? 'grid-cols-1 max-w-[180px]' : compact ? 'grid-cols-4 gap-2 sm:grid-cols-6' : 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5'}`}>
        {value.map((id, i) => (
          <div
            key={id}
            draggable={!single}
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); if (dragIndex !== null) move(dragIndex, i); setDragIndex(null); }}
            onDragEnd={() => setDragIndex(null)}
            className={`group relative aspect-square overflow-hidden rounded-xl bg-cream-deep ${!compact ? 'aspect-[4/5]' : ''} ${!single ? 'cursor-grab active:cursor-grabbing' : ''} ${dragIndex === i ? 'opacity-40' : ''}`}
          >
            <img src={imageUrl(id)} alt="" className="h-full w-full object-cover" draggable={false} />
            {i === 0 && !single && (
              <span className={`absolute left-1 top-1 rounded-full bg-clay font-bold text-white ${compact ? 'px-1.5 py-0 text-[8px]' : 'px-2 py-0.5 text-[10px]'}`}>Kapak</span>
            )}
            <button
              type="button"
              onClick={() => removeAt(i)}
              className={`absolute rounded-full bg-white/90 text-ink shadow hover:bg-red-600 hover:text-white ${compact ? 'right-0.5 top-0.5 p-1' : 'right-1.5 top-1.5 p-1.5'}`}
              aria-label="Kaldır"
            >
              <CloseIcon className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
            </button>
            {!single && value.length > 1 && (
              <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className={`rounded-full bg-white/90 shadow disabled:invisible ${compact ? 'p-1' : 'p-1.5'}`} aria-label="Sola taşı"><ArrowLeftIcon className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} /></button>
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === value.length - 1} className={`rounded-full bg-white/90 shadow disabled:invisible ${compact ? 'p-1' : 'p-1.5'}`} aria-label="Sağa taşı"><ArrowRightIcon className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} /></button>
              </div>
            )}
          </div>
        ))}
        {(single ? value.length === 0 : value.length < max) && dropZone}
        {single && value.length > 0 && (
          <button type="button" onClick={() => inputRef.current?.click()} className="btn-outline btn-sm">
            <ImageIcon className="h-4 w-4" /> Değiştir
          </button>
        )}
      </div>
      {!single && !compact && <p className="mt-2 text-xs text-ink-mute">İlk fotoğraf kapak olur ve WhatsApp mesajında gönderilir. Sürükleyerek sıralayabilirsiniz. Fotoğraflar otomatik küçültülür.</p>}
    </div>
  );
}
