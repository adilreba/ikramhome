'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from '@/components/Icons';
import { imageUrl } from '@/lib/utils';

export default function ProductGallery({ images = [], name }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const touch = useRef(null);
  const n = images.length;
  const go = (d) => setActive((a) => (a + d + n) % n);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setZoom(false);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  if (!n) return <div className="grain aspect-[4/5] rounded-[24px] bg-cream-deep" />;

  const swipe = {
    onTouchStart: (e) => (touch.current = e.touches[0].clientX),
    onTouchEnd: (e) => {
      if (touch.current === null) return;
      const dx = e.changedTouches[0].clientX - touch.current;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      touch.current = null;
    },
  };

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {n > 1 && (
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto sm:max-h-[640px] sm:w-20 sm:flex-col sm:overflow-y-auto">
          {images.map((id, i) => (
            <button
              key={id}
              onClick={() => setActive(i)}
              className={`aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-xl border-2 transition sm:w-full ${i === active ? 'border-ink' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <img src={imageUrl(id)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="relative flex-1 overflow-hidden rounded-[24px] bg-cream-deep" {...swipe}>
        <button onClick={() => setZoom(true)} className="block aspect-[4/5] w-full cursor-zoom-in">
          <img key={images[active]} src={imageUrl(images[active])} alt={name} className="h-full w-full animate-fade-up object-cover" />
        </button>
        {n > 1 && (
          <>
            <button onClick={() => go(-1)} className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 shadow-soft backdrop-blur hover:bg-white" aria-label="Önceki">
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
            <button onClick={() => go(1)} className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 shadow-soft backdrop-blur hover:bg-white" aria-label="Sonraki">
              <ArrowRightIcon className="h-4 w-4" />
            </button>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink/70 px-3 py-1 text-xs font-semibold text-cream tabular-nums">
              {active + 1} / {n}
            </span>
          </>
        )}
      </div>

      {zoom && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 p-4" onClick={() => setZoom(false)} {...swipe}>
          <img src={imageUrl(images[active])} alt={name} className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
          <button className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" aria-label="Kapat">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}
