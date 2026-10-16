'use client';

import { useEffect, useState } from 'react';
import { useCart } from './CartProvider';
import { BagIcon, CheckIcon, CopyIcon, MinusIcon, PlusIcon, WhatsAppIcon } from '@/components/Icons';
import { sendToWhatsApp } from '@/lib/whatsapp';

export default function ProductActions({ product }) {
  const { add, has, setOpen, settings } = useCart();
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const activeVariants = (product.variants || []).filter((v) => v.is_active);
  const hasVariants = activeVariants.length > 0;
  const [variantId, setVariantId] = useState(() => {
    const firstInStock = activeVariants.find((v) => !settings.show_stock || v.stock > 0);
    return (firstInStock || activeVariants[0])?.id ?? null;
  });
  const selectedVariant = hasVariants ? activeVariants.find((v) => v.id === variantId) : null;
  const soldOut = hasVariants
    ? settings.show_stock && (!selectedVariant || selectedVariant.stock <= 0)
    : settings.show_stock && product.stock <= 0;
  const inCart = has(product.id, variantId);

  // Görüntülenme sayısını bir kez arttır
  useEffect(() => {
    const key = `viewed_${product.id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {}
    fetch(`/api/products/${product.slug}/view`, { method: 'POST' }).catch(() => {});
  }, [product.id, product.slug]);

  const askNow = async () => {
    setBusy(true);
    await sendToWhatsApp({
      settings,
      items: [
        {
          product_id: product.id,
          variant_id: selectedVariant?.id ?? null,
          color: selectedVariant?.color ?? null,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image_id: product.cover_image_id,
          qty,
        },
      ],
    });
    setBusy(false);
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {}
  };

  const addToCart = () => {
    if (inCart && qty === 1) {
      setOpen(true);
      return;
    }
    add(product, qty, selectedVariant);
  };

  let addLabel = 'Sepete ekle';
  if (soldOut) addLabel = 'Tükendi';
  else if (inCart && qty === 1) addLabel = 'Sepette · Görüntüle';

  return (
    <div className="mt-8 space-y-3">
      {hasVariants && (
        <div>
          <span className="label">Renk{selectedVariant ? `: ${selectedVariant.color}` : ''}</span>
          <div className="flex flex-wrap gap-2">
            {activeVariants.map((v) => {
              const unavailable = settings.show_stock && v.stock <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={unavailable}
                  onClick={() => setVariantId(v.id)}
                  className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                    v.id === variantId ? 'border-clay bg-clay text-white' : 'border-cream-line hover:border-clay/40'
                  } ${unavailable ? 'cursor-not-allowed opacity-40 line-through' : ''}`}
                >
                  {v.color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex items-center rounded-full border border-cream-line bg-cream">
          <button className="p-3.5 hover:text-clay" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Azalt"><MinusIcon className="h-4 w-4" /></button>
          <span className="w-8 text-center font-semibold tabular-nums">{qty}</span>
          <button className="p-3.5 hover:text-clay" onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="Arttır"><PlusIcon className="h-4 w-4" /></button>
        </div>
        <button disabled={soldOut} onClick={addToCart} className="btn flex-1 bg-clay py-3.5 text-[15px] text-white hover:bg-clay-dark">
          {inCart ? <CheckIcon className="h-5 w-5" /> : <BagIcon className="h-5 w-5" />}
          {addLabel}
        </button>
      </div>
      <button onClick={askNow} disabled={busy} className="btn-wa w-full py-3.5 text-[15px]">
        <WhatsAppIcon className="h-5 w-5" />
        {busy ? 'Hazırlanıyor…' : 'WhatsApp’tan hemen sor'}
      </button>
      <button onClick={share} className="btn-ghost w-full text-xs">
        <CopyIcon className="h-4 w-4" /> {copied ? 'Bağlantı kopyalandı' : 'Ürünü paylaş'}
      </button>
    </div>
  );
}
