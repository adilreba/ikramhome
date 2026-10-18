import Link from 'next/link';
import ProductCard from '@/components/shop/ProductCard';
import Reveal from '@/components/shop/Reveal';
import { ArrowRightIcon, BagIcon, BoxIcon, HeartIcon, ShieldIcon, TruckIcon, WhatsAppIcon } from '@/components/Icons';
import { getSettings, listCategories, listProducts } from '@/lib/queries';
import { imageUrl, normalizePhone } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const TRUST_ITEMS = [
  [TruckIcon, 'Hızlı Kargo'],
  [WhatsAppIcon, 'Kolay Sipariş'],
  [ShieldIcon, 'Orijinal Ürün'],
  [BoxIcon, 'Kolay Değişim'],
];

const STEPS = [
  [HeartIcon, 'Beğen', 'Ürün fotoğraflarına göz atın, kumaş ve renk seçeneklerini inceleyin.'],
  [BagIcon, 'Sepete ekle', 'Beğendiklerinizi adet ve renkleriyle birlikte sepetinize ekleyin.'],
  [WhatsAppIcon, 'WhatsApp’tan gönder', 'Fotoğraf, isim ve fiyatlar mesajınıza otomatik eklenir; ödeme ve teslimatı birlikte konuşuruz.'],
];

export default async function HomePage() {
  const [settings, categories, featured, latest] = await Promise.all([
    getSettings(),
    listCategories(),
    listProducts({ featured: true, limit: 8, sort: 'featured' }),
    listProducts({ limit: 8, sort: 'new' }),
  ]);
  const heroProducts = (featured.items.length ? featured.items : latest.items).filter((p) => p.cover_image_id).slice(0, 3);
  const heroPhoto = settings.hero_image_id || (heroProducts.length > 0 && heroProducts.length < 3 ? heroProducts[0].cover_image_id : null);

  return (
    <>
      {/* HERO */}
      <section className={`relative overflow-hidden text-white ${heroPhoto ? '' : 'bg-gradient-to-br from-clay via-clay to-clay-dark'}`}>
        {heroPhoto ? (
          <>
            <img src={imageUrl(heroPhoto)} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/45 to-ink/10" />
          </>
        ) : (
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 1.5px)', backgroundSize: '22px 22px' }} />
        )}
        <div className={`container-x relative items-center gap-10 py-14 lg:gap-14 lg:py-20 ${heroPhoto ? 'flex min-h-[460px] sm:min-h-[560px] lg:min-h-[640px]' : 'grid lg:grid-cols-12'}`}>
          <div className={`animate-fade-up max-w-xl ${heroPhoto ? '' : 'lg:col-span-6'}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">{settings.tagline || 'Yeni Koleksiyon'}</p>
            <h1 className="h-display mt-5 text-[42px] leading-[1.05] sm:text-6xl lg:text-[70px]">{settings.hero_title}</h1>
            {settings.hero_subtitle && <p className="mt-6 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">{settings.hero_subtitle}</p>}
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/urunler" className="btn-white px-7 py-3.5">
                Ürünleri keşfet <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <a href="#nasil" className="btn px-7 py-3.5 text-white ring-1 ring-inset ring-white/40 hover:bg-white/10">Nasıl sipariş verilir?</a>
            </div>
          </div>

          {!heroPhoto && (
            <div className="relative -mx-2 sm:mx-0 lg:col-span-6">
              {heroProducts.length ? (
                <div className="grid grid-cols-5 grid-rows-6 gap-3 sm:gap-4" style={{ aspectRatio: '1 / 1' }}>
                  {heroProducts.map((p, i) => (
                    <Link
                      key={p.id}
                      href={`/urun/${p.slug}`}
                      className={`group relative overflow-hidden rounded-[22px] shadow-lift ${
                        i === 0 ? 'col-span-3 row-span-6' : 'col-span-2 row-span-3'
                      }`}
                      style={{ animation: `fade-up .7s ${0.1 + i * 0.12}s both` }}
                    >
                      <img src={imageUrl(p.cover_image_id)} alt={p.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                      <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#1B1916] backdrop-blur">{p.name}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="grain flex aspect-square items-center justify-center rounded-[28px] bg-white/10 text-white/70">
                  Admin panelinden ürün ekleyin
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* KATEGORİYE GÖRE ALIŞVERİŞ */}
      {categories.length > 0 && (
        <section className="container-x pt-4">
          <div className="no-scrollbar -mx-4 flex gap-5 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-6 sm:gap-x-5 sm:gap-y-6 sm:overflow-visible sm:px-0 lg:grid-cols-8">
            {categories.map((c, i) => (
              <Reveal key={c.id} delay={i * 50} className="w-[72px] shrink-0 sm:w-auto">
                <Link href={`/urunler?category=${c.slug}`} aria-label={c.name} className="group flex flex-col items-center gap-2 text-center">
                  <span className="h-[72px] w-[72px] overflow-hidden rounded-full bg-cream-deep shadow-soft ring-1 ring-cream-line transition group-hover:ring-clay sm:h-20 sm:w-20">
                    {c.image_id ? (
                      <img src={imageUrl(c.image_id)} alt={c.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center font-display text-2xl text-clay">{c.name[0]}</span>
                    )}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ÖNE ÇIKANLAR */}
      {featured.items.length > 0 && (
        <section className="container-x pt-5">
          <Reveal>
            <SectionHead title="Öne çıkanlar" href="/urunler?sort=featured" />
          </Reveal>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 lg:grid-cols-4">
            {featured.items.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <ProductCard product={p} priority={i < 4} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* NASIL ÇALIŞIR */}
      <section id="nasil" className="container-x scroll-mt-24 pt-8">
        <SectionHead title="Üç adımda sipariş, sohbetle anlaşma" />
        <div className="flex items-stretch gap-2 sm:gap-0">
          {STEPS.map(([Icon, title, text], i) => (
            <div key={title} className="flex flex-1 items-stretch">
              <Reveal delay={i * 220} className="min-w-0 flex-1">
                <div className="h-full rounded-2xl border border-cream-line bg-cream p-2.5 sm:p-5">
                  <div className="flex items-center gap-1.5 sm:gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-clay-light text-clay sm:h-9 sm:w-9">
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </span>
                    <span className="h-display text-base text-clay/30 sm:text-2xl">0{i + 1}</span>
                  </div>
                  <h3 className="mt-2 text-[11px] font-semibold leading-tight sm:mt-3 sm:text-base">{title}</h3>
                  <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-ink-mute sm:mt-1.5 sm:line-clamp-none sm:text-xs sm:leading-relaxed">{text}</p>
                </div>
              </Reveal>
              {i < STEPS.length - 1 && (
                <Reveal delay={i * 220 + 160} className="hidden shrink-0 items-center justify-center px-2.5 sm:flex">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-clay-light text-clay">
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </span>
                </Reveal>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* YENİLER */}
      <section className="container-x pt-8">
        <Reveal>
          <SectionHead title="Son eklenenler" href="/urunler" />
        </Reveal>
        {latest.items.length ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 lg:grid-cols-4">
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

      {/* GÜVEN ROZETLERİ */}
      <section className="container-x pt-8">
        <Reveal>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {TRUST_ITEMS.map(([Icon, title]) => (
              <div key={title} className="flex flex-col items-center gap-2 rounded-2xl border border-cream-line bg-cream py-6 text-center">
                <Icon className="h-7 w-7 text-clay" />
                <p className="text-sm font-semibold">{title}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* KAPANIŞ ÇAĞRISI */}
      <section className="container-x pt-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-clay via-clay to-clay-dark px-6 py-14 text-center text-white sm:px-12">
            <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 1.5px)', backgroundSize: '22px 22px' }} />
            <h2 className="h-display relative text-4xl sm:text-5xl">Evinize şıklık katın</h2>
            <p className="relative mx-auto mt-4 max-w-md text-sm text-white/80 sm:text-base">Beğendiğiniz ürünü sepete ekleyin, WhatsApp’tan bize ulaşın — siparişiniz dakikalar içinde onaylansın.</p>
            <a
              href={`https://wa.me/${normalizePhone(settings.whatsapp_number)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wa relative mx-auto mt-8 w-fit px-8 py-3.5"
            >
              <WhatsAppIcon className="h-5 w-5" /> WhatsApp’tan yazın
            </a>
          </div>
        </Reveal>
      </section>

      {/* HAKKIMIZDA */}
      {settings.about && (
        <section className="container-x pt-8">
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

function SectionHead({ title, href }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-6">
      <h2 className="h-display text-3xl sm:text-4xl">{title}</h2>
      {href && (
        <Link href={href} className="group hidden items-center gap-2 text-sm font-semibold sm:flex">
          Tümünü gör <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
