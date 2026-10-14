'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from './CartProvider';
import { BagIcon, CloseIcon, MinusIcon, PlusIcon, TrashIcon, WhatsAppIcon } from '@/components/Icons';
import { formatPrice, imageUrl } from '@/lib/utils';
import { sendToWhatsApp } from '@/lib/whatsapp';

export default function CartDrawer() {
  const { items, count, total, open, setOpen, setQty, remove, clear, settings } = useCart();
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null);
  const cur = settings.currency;

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, setOpen]);

  useEffect(() => {
    try {
      setName(localStorage.getItem('vitrin_name') || '');
    } catch {}
  }, []);

  const send = async () => {
    if (!items.length || sending) return;
    setSending(true);
    try {
      localStorage.setItem('vitrin_name', name);
    } catch {}
    const id = await sendToWhatsApp({ settings, items, customer: { name: name.trim(), note: note.trim() } });
    setSending(false);
    setSent(id || true);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Sepetim">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md animate-slide-in flex-col bg-cream shadow-lift">
        <div className="flex items-center justify-between border-b border-cream-line px-6 py-5">
          <div>
            <h2 className="h-display text-3xl">Sepetim</h2>
            <p className="text-xs text-ink-mute">{count} ürün</p>
          </div>
          <button className="btn-ghost -mr-3" onClick={() => setOpen(false)} aria-label="Kapat">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-wa/15 text-wa-dark">
              <WhatsAppIcon className="h-8 w-8" />
            </div>
            <h3 className="h-display text-3xl">WhatsApp açıldı</h3>
            <p className="mt-2 text-sm text-ink-mute">
              Mesajı göndermeyi unutmayın. {typeof sent === 'number' && <>Talep numaranız <b className="text-ink">#{sent}</b>.</>} En kısa sürede size dönüş yapacağız.
            </p>
            <div className="mt-8 flex w-full flex-col gap-2">
              <button className="btn-primary" onClick={() => { clear(); setSent(null); setOpen(false); }}>
                Sepeti temizle ve kapat
              </button>
              <button className="btn-outline" onClick={() => setSent(null)}>Sepete geri dön</button>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <BagIcon className="mb-4 h-12 w-12 text-ink-mute/50" />
            <h3 className="h-display text-3xl">Sepetiniz boş</h3>
            <p className="mt-2 text-sm text-ink-mute">Beğendiğiniz ürünleri ekleyin, tek dokunuşla WhatsApp’tan bize iletin.</p>
            <Link href="/urunler" onClick={() => setOpen(false)} className="btn-primary mt-6">Ürünleri keşfet</Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-cream-line overflow-y-auto px-6">
              {items.map((it) => (
                <li key={`${it.product_id}:${it.variant_id || 0}`} className="flex gap-4 py-5">
                  <Link href={`/urun/${it.slug}`} onClick={() => setOpen(false)} className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-cream-deep">
                    {it.image_id && <img src={imageUrl(it.image_id)} alt={it.name} className="h-full w-full object-cover" />}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/urun/${it.slug}`} onClick={() => setOpen(false)} className="line-clamp-2 text-sm font-semibold leading-snug">
                        {it.name}
                      </Link>
                      <button onClick={() => remove(it.product_id, it.variant_id)} className="-mr-1 -mt-1 rounded-full p-1.5 text-ink-mute hover:bg-ink/5 hover:text-ink" aria-label="Kaldır">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    {it.color && <p className="mt-0.5 text-xs text-ink-mute">Renk: {it.color}</p>}
                    <p className="mt-1 text-sm text-ink-mute">{formatPrice(it.price, cur)}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border border-cream-line bg-white">
                        <button className="p-2 hover:text-clay" onClick={() => setQty(it.product_id, it.qty - 1, it.variant_id)} aria-label="Azalt"><MinusIcon className="h-3.5 w-3.5" /></button>
                        <span className="w-6 text-center text-sm font-semibold tabular-nums">{it.qty}</span>
                        <button className="p-2 hover:text-clay" onClick={() => setQty(it.product_id, it.qty + 1, it.variant_id)} aria-label="Arttır"><PlusIcon className="h-3.5 w-3.5" /></button>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">{formatPrice(it.qty * it.price, cur)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-cream-line bg-white/70 px-6 pb-6 pt-4">
              <details className="group mb-3">
                <summary className="cursor-pointer list-none text-xs font-semibold text-ink-soft">
                  <span className="group-open:hidden">+ İsim ve not ekle (isteğe bağlı)</span>
                  <span className="hidden group-open:inline">− İsim ve not</span>
                </summary>
                <div className="mt-3 space-y-2">
                  <input className="input" placeholder="Adınız Soyadınız" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
                  <textarea className="input min-h-[70px]" placeholder="Beden, renk, teslimat vb. notunuz" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
                </div>
              </details>
              <div className="mb-4 flex items-baseline justify-between">
                <span className="text-sm text-ink-mute">Toplam</span>
                <span className="h-display text-3xl tabular-nums">{formatPrice(total, cur)}</span>
              </div>
              <button onClick={send} disabled={sending} className="btn-wa w-full py-4 text-base">
                <WhatsAppIcon className="h-5 w-5" />
                {sending ? 'Hazırlanıyor…' : 'WhatsApp ile Sipariş Ver'}
              </button>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-mute">
                Ürün fotoğrafları, isimleri ve fiyatları mesajınıza eklenir. Ödeme ve teslimatı satıcıyla WhatsApp’tan konuşarak netleştirirsiniz.
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
