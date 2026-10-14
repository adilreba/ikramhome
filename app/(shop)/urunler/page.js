import Link from 'next/link';
import ProductCard from '@/components/shop/ProductCard';
import ShopFilters from '@/components/shop/ShopFilters';
import { getCategoryBySlug, listCategories, listProducts } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
  const cat = searchParams.category ? await getCategoryBySlug(String(searchParams.category)) : null;
  return { title: cat ? cat.name : searchParams.q ? `“${searchParams.q}” araması` : 'Tüm Ürünler' };
}

export default async function ProductsPage({ searchParams }) {
  const sp = {
    q: String(searchParams.q || ''),
    category: searchParams.category ? String(searchParams.category) : '',
    sort: String(searchParams.sort || 'new'),
    min: searchParams.min ? String(searchParams.min) : '',
    max: searchParams.max ? String(searchParams.max) : '',
    page: Number(searchParams.page) || 1,
  };
  const [categories, data, current] = await Promise.all([
    listCategories(),
    listProducts({ q: sp.q, category: sp.category || null, sort: sp.sort, minPrice: sp.min, maxPrice: sp.max, page: sp.page, limit: 24 }),
    sp.category ? getCategoryBySlug(sp.category) : null,
  ]);

  const pageHref = (p) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...sp, page: p })) if (v && !(k === 'page' && p === 1) && !(k === 'sort' && v === 'new')) u.set(k, v);
    return `/urunler${u.toString() ? `?${u}` : ''}`;
  };

  return (
    <div className="container-x pt-10">
      <div className="mb-8">
        <p className="eyebrow mb-2">{data.total} ürün</p>
        <h1 className="h-display text-5xl sm:text-6xl">{current?.name || (sp.q ? `“${sp.q}”` : 'Tüm Ürünler')}</h1>
        {current?.description && <p className="mt-3 max-w-xl text-ink-mute">{current.description}</p>}
      </div>

      <ShopFilters categories={categories} current={sp} />

      {data.items.length ? (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {data.items.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
        </div>
      ) : (
        <div className="card mt-10 p-14 text-center">
          <p className="h-display text-3xl">Sonuç bulunamadı</p>
          <p className="mt-2 text-sm text-ink-mute">Farklı bir arama veya kategori deneyin.</p>
          <Link href="/urunler" className="btn-outline mt-6">Filtreleri temizle</Link>
        </div>
      )}

      {data.pages > 1 && (
        <nav className="mt-14 flex items-center justify-center gap-1.5">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              className={`flex h-10 min-w-[40px] items-center justify-center rounded-full px-3 text-sm font-semibold ${p === data.page ? 'bg-ink text-cream' : 'hover:bg-ink/5'}`}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
