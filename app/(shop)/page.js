import Link from 'next/link';
import ProductCard from '@/components/shop/ProductCard';
import Reveal from '@/components/shop/Reveal';
import { ArrowRightIcon, BagIcon, HeartIcon, WhatsAppIcon } from '@/components/Icons';
import { getSettings, listCategories, listProducts } from '@/lib/queries';
import { imageUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [settings, categories, featured, latest] = await Promise.all([
    getSettings(),
    listCategories(),
    listProducts({ featured: true, limit: 8, sort: 'featured' }),
    listProducts({ limit: 8, sort: 'new' }),
  ]);
  const heroProducts = (featured.items.length ? featured.items : latest.items).filter((p) => p.cover_image_id).slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-[420px] w-[420px] animate-blob rounded-full bg-clay/25 blur-[90px]" />
          <div className="absolute -right-10 top-10 h-[360px] w-[360px] animate-blob-slow rounded-full bg-wine/25 blur-[100px]" />
          <div className="absolute bottom-0 left-1/3 h-[320px] w-[320px] animate-blob rounded-full bg-clay/10 blur-[110px]" />
        </div>
        <div className="container-x pb-16 pt-8 sm:pt-12 lg:pb-24">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="animate-fade-up lg:col-span-6">
            <p className="eyebrow mb-5">{settings.tagline || 'Yeni sezon'}</p>
            <h1 className="h-display text-[44px] sm:text-6xl lg:text-[76px]">{settings.hero_title}</h1>
            {settings.hero_subtitle && <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-mute sm:text-lg">{settings.hero_subtitle}</p>}
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/urunler" className="btn-primary px-7 py-3.5">
                Ürünleri keşfet <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <a href="#nasil" className="btn-outline px-7 py-3.5">Nasıl sipariş verilir?</a>
            </div>
          </div>

          <div className="relative lg:col-span-6">
            {settings.hero_image_id || (heroProducts.length > 0 && heroProducts.length < 3) ? (
              <div className="aspect-[5/6] overflow-hidden rounded-[28px] bg-cream-deep sm:aspect-[4/3] lg:aspect-[5/6]">
                <img src={imageUrl(settings.hero_image_id || heroProducts[0].cover_image_id)} alt="" className="h-full w-full object-cover" />
              </div>
            ) : heroProducts.length ? (
              <div className="grid grid-cols-5 grid-rows-6 gap-3 sm:gap-4" style={{ aspectRatio: '1 / 1' }}>
                {heroProducts.map((p, i) => (
                  <Link
                    key={p.id}
                    href={`/urun/${p.slug}`}
                    className={`group relative overflow-hidden rounded-[22px] bg-cream-deep ${
                      i === 0 ? 'col-span-3 row-span-6' : i === 1 ? 'col-span-2 row-span-3' : 'col-span-2 row-span-3'
                    }`}
                    style={{ animation: `fade-up .7s ${0.1 + i * 0.12}s both` }}
                  >
                    <img src={imageUrl(p.cover_image_id)} alt={p.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#1B1916] backdrop-blur">{p.name}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grain flex aspect-square items-center justify-center rounded-[28px] bg-cream-deep text-ink-mute">
                Admin panelinden ürün ekleyin
              </div>
            )}
          </div>
        </div>
        </div>
      </section>

      {/* KATEGORİLER */}
      {categories.length > 0 && (
        <section className="border-y border-clay/10 bg-cream-deep/60">
          <div className="container-x no-scrollbar flex gap-2.5 overflow-x-auto py-5">
            <Link href="/urunler" className="chip chip-active">Tümü</Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/urunler?category=${c.slug}`} className="chip">
                {c.name} <span className="text-xs text-ink-mute">{c.product_count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ÖNE ÇIKANLAR */}
      {featured.items.length > 0 && (
        <section className="container-x pt-20">
          <Reveal>
            <SectionHead eyebrow="Seçkimiz" title="Öne çıkanlar" href="/urunler?sort=featured" />
          </Reveal>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {featured.items.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <ProductCard product={p} priority={i < 4} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* NASIL ÇALIŞIR */}
      <section id="nasil" className="container-x scroll-mt-24 pt-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] border border-clay/20 bg-cream-deep px-6 py-14 text-ink shadow-gold sm:px-12 lg:px-16">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 animate-blob-slow rounded-full bg-clay/15 blur-[90px]" />
            <p className="eyebrow">Kolay sipariş</p>
            <h2 className="h-display mt-3 max-w-xl text-4xl sm:text-5xl">Üç adımda sipariş, sohbetle anlaşma</h2>
            <div className="mt-12 grid gap-10 sm:grid-cols-3">
              {[
                [HeartIcon, 'Beğen', 'Ürün fotoğraflarına göz atın, detaylarını inceleyin.'],
                [BagIcon, 'Sepete ekle', 'Beğendiklerinizi adetleriyle birlikte sepetinize ekleyin.'],
                [WhatsAppIcon, 'WhatsApp’tan gönder', 'Fotoğraf, isim ve fiyatlar mesajınıza otomatik eklenir; ödeme ve teslimatı birlikte konuşuruz.'],
              ].map(([Icon, title, text], i) => (
                <div key={title}>
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-clay/30 text-clay">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="h-display text-5xl text-clay/20">0{i + 1}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-mute">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* YENİLER */}
      <section className="container-x pt-24">
        <Reveal>
          <SectionHead eyebrow="Yeni gelenler" title="Son eklenenler" href="/urunler" />
        </Reveal>
        {latest.items.length ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {latest.items.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="card p-10 text-center text-ink-mute">Henüz ürün eklenmemiş.</p>
        )}
      </section>

      {/* HAKKIMIZDA */}
      {settings.about && (
        <section className="container-x pt-24">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-12">
              <p className="eyebrow lg:col-span-3">Hakkımızda</p>
              <p className="h-display text-3xl leading-snug text-ink-soft sm:text-4xl lg:col-span-9 whitespace-pre-line">{settings.about}</p>
            </div>
          </Reveal>
        </section>
      )}
    </>
  );
}

function SectionHead({ eyebrow, title, href }) {
  return (
    <div className="mb-10 flex items-end justify-between gap-6">
      <div>
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h2 className="h-display text-4xl sm:text-5xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="group hidden items-center gap-2 text-sm font-semibold sm:flex">
          Tümünü gör <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
