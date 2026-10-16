'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';
import { BagIcon, CheckIcon } from '@/components/Icons';
import { colorToHex, discountPercent, formatPrice, imageUrl } from '@/lib/utils';

export default function ProductCard({ product, priority = false }) {
  const { add, has, settings } = useCart();
  const inCart = has(product.id);
  const off = discountPercent(product.price, product.old_price);
  const [first, second] = product.image_ids || [];
  const soldOut = settings.show_stock && product.stock <= 0;
  const colors = (product.variants || []).filter((v) => v.is_active);

  return (
    <article className="group transition-transform duration-300 ease-out hover:-translate-y-1.5">
      <div className="relative">
      <Link
        href={`/urun/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-cream-deep shadow-soft transition-shadow duration-300 group-hover:shadow-lift"
      >
        {first ? (
          <>
            <img
              src={imageUrl(first)}
              alt={product.name}
              loading={priority ? 'eager' : 'lazy'}
              className={`absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04] ${second ? 'group-hover:opacity-0' : ''}`}
            />
            {second && (
              <img src={imageUrl(second)} alt="" loading="lazy" className="absolute inset-0 h-full w-full scale-[1.04] object-cover opacity-0 transition duration-700 ease-out group-hover:scale-100 group-hover:opacity-100" />
            )}
          </>
        ) : (
          <div className="grain absolute inset-0" />
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {off > 0 && <span className="rounded-full bg-clay px-2.5 py-1 text-[11px] font-bold text-white">%{off}</span>}
          {soldOut && <span className="rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-semibold text-cream">Tükendi</span>}
        </div>
      </Link>

      <button
        onClick={() => add(product)}
        disabled={soldOut}
        aria-label="Sepete ekle"
        className={`absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full shadow-soft transition duration-300 ${
          inCart ? 'bg-ink text-cream' : 'bg-white text-ink hover:bg-ink hover:text-cream sm:opacity-0 sm:group-hover:opacity-100'
        } disabled:hidden`}
      >
        {inCart ? <CheckIcon className="h-5 w-5" /> : <BagIcon className="h-5 w-5" />}
      </button>
      </div>

      <div className="mt-3.5 px-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {product.category_name && <p className="mb-0.5 text-[11px] uppercase tracking-[0.14em] text-ink-mute">{product.category_name}</p>}
            <h3 className="line-clamp-2 text-[15px] font-medium leading-snug">
              <Link href={`/urun/${product.slug}`}>{product.name}</Link>
            </h3>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[15px] font-semibold tabular-nums">{formatPrice(product.price, settings.currency)}</p>
            {off > 0 && <p className="text-xs text-ink-mute line-through tabular-nums">{formatPrice(product.old_price, settings.currency)}</p>}
          </div>
        </div>
        {colors.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            {colors.slice(0, 5).map((v) => (
              <span key={v.id} className="swatch-dot" style={{ background: colorToHex(v.color) || '#D8D0C4' }} title={v.color} />
            ))}
            {colors.length > 5 && <span className="text-[11px] text-ink-mute">+{colors.length - 5}</span>}
          </div>
        )}
      </div>
    </article>
  );
}
