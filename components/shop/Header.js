'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from './CartProvider';
import { BagIcon, CloseIcon, MenuIcon, SearchIcon } from '@/components/Icons';
import { imageUrl } from '@/lib/utils';

export default function Header({ settings, categories }) {
  const { count, setOpen, bump } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenu(false);
    setSearch(false);
  }, [pathname]);

  const submit = (e) => {
    e.preventDefault();
    router.push(`/urunler${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
  };

  return (
    <>
      <div className="bg-ink text-cream">
        <p className="container-x py-1 text-center text-[11px] tracking-wide text-cream/80">
          {settings.announcement || 'Siparişleriniz WhatsApp üzerinden hızlıca onaylanır'}
        </p>
      </div>
      <header className={`sticky top-0 z-40 bg-cream transition-shadow duration-300 ${scrolled ? 'shadow-soft' : ''}`}>
        <div className="container-x flex h-11 items-center gap-2 border-b border-cream-line sm:h-12 sm:gap-4">
          <button className="btn-ghost -ml-3 shrink-0 lg:hidden" onClick={() => setMenu(true)} aria-label="Menü">
            <MenuIcon className="h-6 w-6" />
          </button>

          <Link href="/" className="flex min-w-0 items-center gap-3">
            {settings.logo_image_id ? (
              <img src={imageUrl(settings.logo_image_id)} alt={settings.store_name} className="h-9 w-auto sm:h-11" />
            ) : (
              <span className="h-display truncate text-[19px] uppercase tracking-[0.04em] sm:text-[24px] sm:tracking-[0.08em] lg:text-[28px]">{settings.store_name}</span>
            )}
          </Link>

          <form onSubmit={submit} className="relative ml-auto hidden w-64 shrink-0 xl:block">
            <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ürün ara…" className="input rounded-full border-transparent bg-ink/[0.06] py-1.5 pl-9 text-sm focus:bg-cream focus:border-clay/50" />
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-1 xl:ml-2">
            <button className="btn-ghost xl:hidden" onClick={() => setSearch((s) => !s)} aria-label="Ara">
              <SearchIcon className="h-[22px] w-[22px]" />
            </button>
            <button className="btn-ghost relative" onClick={() => setOpen(true)} aria-label="Sepet">
              <BagIcon className="h-[22px] w-[22px]" />
              {count > 0 && (
                <span key={bump} className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] animate-pop items-center justify-center rounded-full bg-clay px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="relative hidden overflow-hidden border-b-2 border-clay shadow-[0_2px_14px_-2px_rgba(201,79,36,0.55)] lg:block">
          <div className="flex w-max animate-marquee gap-10 py-2.5 text-sm font-medium text-ink-soft hover:[animation-play-state:paused]">
            {[0, 1].map((dup) => (
              <div key={dup} aria-hidden={dup === 1} className="flex shrink-0 gap-10 pl-6">
                <Link href="/urunler" className="shrink-0 whitespace-nowrap transition hover:text-clay">Tüm Ürünler</Link>
                {categories.map((c) => (
                  <Link key={c.id} href={`/urunler?category=${c.slug}`} className="shrink-0 whitespace-nowrap transition hover:text-clay">
                    {c.name}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        {search && (
          <form onSubmit={submit} className="container-x animate-fade-up py-2 xl:hidden">
            <div className="relative">
              <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ürün, kategori veya etiket ara…" className="input rounded-full border-transparent bg-ink/[0.06] py-1.5 pl-9 text-sm focus:bg-cream focus:border-clay/50" />
            </div>
          </form>
        )}
      </header>

      {menu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMenu(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[70%] max-w-xs flex-col bg-cream p-6 shadow-lift" style={{ animation: 'fade-up .3s both' }}>
            <div className="mb-8 flex items-center justify-between">
              <span className="h-display text-2xl">{settings.store_name}</span>
              <button className="btn-ghost -mr-3" onClick={() => setMenu(false)} aria-label="Kapat">
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col divide-y divide-cream-line text-lg">
              <Link href="/" className="py-3.5 transition hover:text-clay">Ana Sayfa</Link>
              <Link href="/urunler" className="py-3.5 transition hover:text-clay">Tüm Ürünler</Link>
              {categories.map((c) => (
                <Link key={c.id} href={`/urunler?category=${c.slug}`} className="flex items-center justify-between py-3.5 transition hover:text-clay">
                  {c.name}
                  <span className="text-xs text-ink-mute">{c.product_count}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
