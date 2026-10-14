import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/shop/ProductCard';
import ProductGallery from '@/components/shop/ProductGallery';
import ProductActions from '@/components/shop/ProductActions';
import { getProductBySlug, getRelatedProducts, getSettings } from '@/lib/queries';
import { discountPercent, formatPrice, imageUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const p = await getProductBySlug(params.slug);
  if (!p) return { title: 'Ürün bulunamadı' };
  const s = await getSettings();
  const desc = (p.description || `${p.name} — ${formatPrice(p.price, s.currency)}`).slice(0, 180);
  // WhatsApp'ta link paylaşıldığında bu görsel ve başlık önizleme olarak görünür
  return {
    title: p.name,
    description: desc,
    openGraph: {
      title: `${p.name} · ${formatPrice(p.price, s.currency)}`,
      description: desc,
      type: 'website',
      images: p.cover_image_id ? [{ url: imageUrl(p.cover_image_id), alt: p.name }] : [],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function ProductPage({ params }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();
  const [related, settings] = await Promise.all([getRelatedProducts(product), getSettings()]);
  const off = discountPercent(product.price, product.old_price);

  return (
    <div className="container-x pt-6">
      <nav className="mb-6 flex items-center gap-2 text-xs text-ink-mute">
        <Link href="/" className="hover:text-ink">Ana Sayfa</Link>
        <span>/</span>
        <Link href="/urunler" className="hover:text-ink">Ürünler</Link>
        {product.category_slug && (
          <>
            <span>/</span>
            <Link href={`/urunler?category=${product.category_slug}`} className="hover:text-ink">{product.category_name}</Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <ProductGallery images={product.image_ids} name={product.name} />
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            {product.category_name && <p className="eyebrow mb-3">{product.category_name}</p>}
            <h1 className="h-display text-4xl sm:text-5xl">{product.name}</h1>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl font-semibold tabular-nums">{formatPrice(product.price, settings.currency)}</span>
              {off > 0 && (
                <>
                  <span className="text-lg text-ink-mute line-through tabular-nums">{formatPrice(product.old_price, settings.currency)}</span>
                  <span className="rounded-full bg-clay px-2.5 py-1 text-xs font-bold text-white">%{off} indirim</span>
                </>
              )}
            </div>
            {product.sku && <p className="mt-2 text-xs text-ink-mute">Ürün kodu: {product.sku}</p>}
            {settings.show_stock && (
              <p className={`mt-3 text-sm font-medium ${product.stock > 0 ? 'text-emerald-700' : 'text-clay-dark'}`}>
                {product.stock > 0 ? (product.stock <= 3 ? `Son ${product.stock} adet` : 'Stokta') : 'Tükendi — WhatsApp’tan sorabilirsiniz'}
              </p>
            )}

            <ProductActions product={product} />

            {product.description && (
              <div className="mt-10 border-t border-cream-line pt-8">
                <h2 className="mb-3 text-sm font-semibold">Ürün açıklaması</h2>
                <div className="whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">{product.description}</div>
              </div>
            )}

            {product.tags?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((t) => (
                  <Link key={t} href={`/urunler?q=${encodeURIComponent(t)}`} className="rounded-full bg-cream-deep px-3 py-1 text-xs text-ink-soft hover:bg-cream-line">
                    #{t}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="pt-24">
          <p className="eyebrow mb-2">Bunlar da ilginizi çekebilir</p>
          <h2 className="h-display mb-10 text-4xl sm:text-5xl">Benzer ürünler</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
