'use client';

import Link from 'next/link';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Empty, PageHeader, Pagination, Spinner, useAdminUI } from '@/components/admin/AdminUI';
import { CopyIcon, EditIcon, ExternalIcon, PlusIcon, SearchIcon, StarIcon, TrashIcon } from '@/components/Icons';
import { api } from '@/lib/client-api';
import { colorToHex, formatPrice, imageUrl } from '@/lib/utils';

const STATUS_TABS = [
  ['all', 'Tümü'],
  ['active', 'Yayında'],
  ['inactive', 'Gizli'],
  ['out_of_stock', 'Stok yok'],
];

function ProductsList() {
  const sp = useSearchParams();
  const { notify, confirm } = useAdminUI();
  const [filters, setFilters] = useState({ q: '', category: '', status: sp.get('status') || 'all', sort: 'new', page: 1 });
  const [qInput, setQInput] = useState('');
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const u = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && u.set(k, v));
    try {
      setData(await api(`/api/admin/products?${u}`));
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, notify]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { api('/api/admin/categories').then(setCategories).catch(() => {}); }, []);
  useEffect(() => setSelected([]), [filters]);

  // Arama kutusu: yazmayı bırakınca ara
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.q === qInput ? f : { ...f, q: qInput, page: 1 })), 350);
    return () => clearTimeout(t);
  }, [qInput]);

  const patch = async (p, body) => {
    setData((d) => ({ ...d, items: d.items.map((x) => (x.id === p.id ? { ...x, ...body } : x)) }));
    try {
      await api(`/api/admin/products/${p.id}`, { method: 'PATCH', body });
    } catch (e) {
      notify(e.message, 'error');
      load();
    }
  };

  const remove = async (p) => {
    if (!(await confirm({ title: 'Ürün silinsin mi?', message: `“${p.name}” ve fotoğrafları kalıcı olarak silinecek.`, danger: true, confirmText: 'Sil' }))) return;
    try {
      await api(`/api/admin/products/${p.id}`, { method: 'DELETE' });
      notify('Ürün silindi');
      load();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const duplicate = async (p) => {
    try {
      const copy = await api(`/api/admin/products/${p.id}/duplicate`, { method: 'POST' });
      notify(`Kopya oluşturuldu (gizli): ${copy.name}`);
      load();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const bulk = async (action, extra = {}) => {
    if (!selected.length) return;
    if (action === 'delete' && !(await confirm({ title: `${selected.length} ürün silinsin mi?`, message: 'Bu işlem geri alınamaz.', danger: true, confirmText: 'Sil' }))) return;
    try {
      const r = await api('/api/admin/products/bulk', { method: 'POST', body: { ids: selected, action, ...extra } });
      notify(`${r.affected} ürün güncellendi`);
      setSelected([]);
      load();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const items = data?.items || [];
  const allChecked = items.length > 0 && items.every((i) => selected.includes(i.id));

  return (
    <>
      <PageHeader title="Ürünler" subtitle={data ? `${data.total} ürün` : ' '}>
        <Link href="/admin/urunler/yeni" className="btn-primary btn-sm py-2.5"><PlusIcon className="h-4 w-4" /> Yeni ürün</Link>
      </PageHeader>

      <div className="card mb-4 flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-cream p-1">
          {STATUS_TABS.map(([v, l]) => (
            <button key={v} onClick={() => setFilters((f) => ({ ...f, status: v, page: 1 }))} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${filters.status === v ? 'bg-white font-semibold shadow-sm' : 'text-ink-mute'}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
          <input value={qInput} onChange={(e) => setQInput(e.target.value)} placeholder="Ürün adı, kod veya etiket…" className="input pl-9" />
        </div>
        <select value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value, page: 1 }))} className="input lg:w-48">
          <option value="">Tüm kategoriler</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filters.sort} onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))} className="input lg:w-44">
          <option value="new">En yeni</option>
          <option value="name">İsme göre</option>
          <option value="price_asc">Fiyat ↑</option>
          <option value="price_desc">Fiyat ↓</option>
          <option value="popular">En çok bakılan</option>
        </select>
      </div>

      {selected.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-clay px-4 py-2.5 text-sm text-white">
          <span className="mr-2 font-semibold">{selected.length} seçili</span>
          <button className="rounded-lg px-2.5 py-1 hover:bg-white/15" onClick={() => bulk('activate')}>Yayınla</button>
          <button className="rounded-lg px-2.5 py-1 hover:bg-white/15" onClick={() => bulk('deactivate')}>Gizle</button>
          <button className="rounded-lg px-2.5 py-1 hover:bg-white/15" onClick={() => bulk('feature')}>Öne çıkar</button>
          <button className="rounded-lg px-2.5 py-1 hover:bg-white/15" onClick={() => bulk('unfeature')}>Öne çıkarmayı kaldır</button>
          <select className="rounded-lg bg-white/15 px-2 py-1 text-white" value="" onChange={(e) => e.target.value && bulk('set_category', { category_id: e.target.value === 'none' ? null : Number(e.target.value) })}>
            <option value="" className="text-ink">Kategoriye taşı…</option>
            <option value="none" className="text-ink">Kategorisiz</option>
            {categories.map((c) => <option key={c.id} value={c.id} className="text-ink">{c.name}</option>)}
          </select>
          <button className="ml-auto rounded-lg px-2.5 py-1 text-white hover:bg-white/15" onClick={() => bulk('delete')}>Sil</button>
        </div>
      )}

      {loading && !data ? (
        <div className="flex justify-center py-20 text-ink-mute"><Spinner className="h-8 w-8" /></div>
      ) : items.length === 0 ? (
        <Empty title="Ürün bulunamadı" text="Filtreleri değiştirin veya ilk ürününüzü ekleyin.">
          <Link href="/admin/urunler/yeni" className="btn-primary">Ürün ekle</Link>
        </Empty>
      ) : (
        <div className={`card overflow-hidden transition ${loading ? 'opacity-60' : ''}`}>
          <table className="w-full text-sm">
            <thead className="hidden border-b border-cream-line bg-cream/60 text-left text-xs text-ink-mute md:table-header-group">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allChecked} onChange={() => setSelected(allChecked ? [] : items.map((i) => i.id))} className="accent-clay" />
                </th>
                <th className="py-3 font-medium">Ürün</th>
                <th className="py-3 font-medium">Fiyat</th>
                <th className="py-3 font-medium">Stok</th>
                <th className="py-3 font-medium">Yayında</th>
                <th className="px-4 py-3 text-right font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-line">
              {items.map((p) => (
                <tr key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3 md:table-row md:p-0">
                  <td className="md:px-4 md:py-3">
                    <input type="checkbox" checked={selected.includes(p.id)} onChange={() => setSelected((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]))} className="accent-clay" />
                  </td>
                  <td className="min-w-0 flex-1 md:py-3">
                    <Link href={`/admin/urunler/${p.id}`} className="flex items-center gap-3">
                      <span className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-cream-deep">
                        {p.cover_image_id && <img src={imageUrl(p.cover_image_id)} alt="" className="h-full w-full object-cover" />}
                        {p.image_ids.length > 1 && (
                          <span className="absolute right-0.5 top-0.5 rounded-full bg-ink/80 px-1 text-[9px] font-bold leading-[14px] text-white">{p.image_ids.length}</span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <span className="truncate">{p.name}</span>
                          {p.is_featured && <StarIcon className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-500" />}
                        </span>
                        <span className="block truncate text-xs text-ink-mute">
                          {p.category_name || 'Kategorisiz'}{p.sku ? ` · ${p.sku}` : ''} · {p.image_ids.length} foto · {p.views} görüntülenme
                        </span>
                        {p.variants?.length > 0 && (
                          <span className="mt-1 flex items-center gap-1">
                            {p.variants.slice(0, 6).map((v) => (
                              <span
                                key={v.id}
                                className={`h-3 w-3 shrink-0 rounded-full ring-1 ring-black/10 ${v.is_active === false ? 'opacity-30' : ''}`}
                                style={{ background: colorToHex(v.color) || '#D8D0C4' }}
                                title={`${v.color}${v.is_active === false ? ' (arşivde)' : ''}`}
                              />
                            ))}
                            <span className="text-[11px] text-ink-mute">{p.variants.length} renk</span>
                          </span>
                        )}
                      </span>
                    </Link>
                  </td>
                  <td className="tabular-nums md:py-3">
                    <span className="font-semibold">{formatPrice(p.price)}</span>
                    {p.old_price ? <span className="ml-1.5 text-xs text-ink-mute line-through">{formatPrice(p.old_price)}</span> : null}
                  </td>
                  <td className="md:py-3">
                    <input
                      type="number"
                      min="0"
                      defaultValue={p.stock}
                      key={`${p.id}-${p.stock}`}
                      onBlur={(e) => Number(e.target.value) !== p.stock && patch(p, { stock: Math.max(0, Number(e.target.value) || 0) })}
                      className={`w-20 rounded-lg border px-2 py-1 text-sm tabular-nums ${p.stock <= 0 ? 'border-clay/40 bg-clay-light/40' : 'border-cream-line'}`}
                      aria-label="Stok"
                    />
                  </td>
                  <td className="md:py-3">
                    <button onClick={() => patch(p, { is_active: !p.is_active })} className={`relative h-6 w-11 rounded-full transition ${p.is_active ? 'bg-wa' : 'bg-cream-line'}`} aria-label="Yayın durumu">
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${p.is_active ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </td>
                  <td className="ml-auto md:px-4 md:py-3">
                    <div className="flex justify-end gap-0.5">
                      <button onClick={() => patch(p, { is_featured: !p.is_featured })} className="rounded-lg p-2 text-ink-mute hover:bg-cream hover:text-amber-600" title="Öne çıkar">
                        <StarIcon className={`h-4 w-4 ${p.is_featured ? 'fill-amber-400 text-amber-500' : ''}`} />
                      </button>
                      <a href={`/urun/${p.slug}`} target="_blank" className="rounded-lg p-2 text-ink-mute hover:bg-cream hover:text-ink" title="Sitede gör"><ExternalIcon className="h-4 w-4" /></a>
                      <button onClick={() => duplicate(p)} className="rounded-lg p-2 text-ink-mute hover:bg-cream hover:text-ink" title="Kopyala"><CopyIcon className="h-4 w-4" /></button>
                      <Link href={`/admin/urunler/${p.id}`} className="rounded-lg p-2 text-ink-mute hover:bg-cream hover:text-ink" title="Düzenle"><EditIcon className="h-4 w-4" /></Link>
                      <button onClick={() => remove(p)} className="rounded-lg p-2 text-ink-mute hover:bg-red-50 hover:text-red-600" title="Sil"><TrashIcon className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && <Pagination page={data.page} pages={data.pages} onChange={(p) => setFilters((f) => ({ ...f, page: p }))} />}
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsList />
    </Suspense>
  );
}
