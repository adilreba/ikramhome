'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ImageUploader from './ImageUploader';
import { Field, Toggle, useAdminUI } from './AdminUI';
import { ArrowLeftIcon, CloseIcon, ExternalIcon, TrashIcon } from '@/components/Icons';
import { api } from '@/lib/client-api';
import { discountPercent, slugify } from '@/lib/utils';

const EMPTY = {
  name: '',
  slug: '',
  description: '',
  sku: '',
  price: '',
  old_price: '',
  stock: 1,
  category_id: '',
  is_active: true,
  is_featured: false,
  tags: [],
  image_ids: [],
  variants: [],
};

export default function ProductForm({ productId }) {
  const router = useRouter();
  const { notify, confirm } = useAdminUI();
  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(!!productId);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!productId);

  useEffect(() => {
    api('/api/admin/categories').then(setCategories).catch(() => {});
    if (!productId) return;
    api(`/api/admin/products/${productId}`)
      .then((p) =>
        setForm({
          ...EMPTY,
          ...p,
          description: p.description || '',
          sku: p.sku || '',
          old_price: p.old_price ?? '',
          category_id: p.category_id ?? '',
          tags: p.tags || [],
          variants: p.variants || [],
        })
      )
      .catch((e) => notify(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [productId, notify]);

  // Kaydedilmemiş değişiklik uyarısı
  useEffect(() => {
    if (!dirty) return;
    const h = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const set = (key, val) => {
    setDirty(true);
    setForm((f) => {
      const next = { ...f, [key]: val };
      if (key === 'name' && !slugTouched) next.slug = val.trim() ? slugify(val) : '';
      return next;
    });
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
    setTagInput('');
  };

  const save = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setErrors({});
    const body = {
      ...form,
      price: form.price === '' ? undefined : Number(form.price),
      old_price: form.old_price === '' ? null : Number(form.old_price),
      stock: Number(form.stock) || 0,
      category_id: form.category_id === '' ? null : Number(form.category_id),
    };
    for (const k of ['id', 'views', 'created_at', 'updated_at', 'category_name', 'category_slug', 'cover_image_id']) delete body[k];
    try {
      if (productId) await api(`/api/admin/products/${productId}`, { method: 'PUT', body });
      else await api('/api/admin/products', { method: 'POST', body });
      setDirty(false);
      notify(productId ? 'Değişiklikler kaydedildi' : 'Ürün eklendi');
      router.replace('/admin/urunler');
    } catch (err) {
      setErrors(err.fields || {});
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!(await confirm({ title: 'Ürün silinsin mi?', message: 'Ürün ve fotoğrafları kalıcı olarak silinecek.', danger: true, confirmText: 'Sil' }))) return;
    try {
      await api(`/api/admin/products/${productId}`, { method: 'DELETE' });
      setDirty(false);
      notify('Ürün silindi');
      router.replace('/admin/urunler');
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  if (loading) return <div className="py-24 text-center text-ink-mute">Yükleniyor…</div>;

  const off = discountPercent(form.price, form.old_price);

  return (
    <form onSubmit={save} className="pb-24">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href="/admin/urunler" className="btn-ghost -ml-3"><ArrowLeftIcon className="h-4 w-4" /> Ürünler</Link>
        <h1 className="h-display w-full text-4xl sm:w-auto">{productId ? 'Ürünü düzenle' : 'Yeni ürün'}</h1>
        {productId && form.slug && (
          <a href={`/urun/${form.slug}`} target="_blank" className="btn-outline btn-sm sm:ml-auto"><ExternalIcon className="h-4 w-4" /> Sitede gör</a>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card space-y-4 p-5">
            <Field label="Ürün adı *" error={errors.name}>
              <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ör. El yapımı seramik kupa" autoFocus={!productId} />
            </Field>
            <Field label="Açıklama" error={errors.description} hint="Malzeme, ölçü, renk seçenekleri, bakım bilgisi vb.">
              <textarea className="input min-h-[160px]" value={form.description} onChange={(e) => set('description', e.target.value)} />
            </Field>
          </section>

          <section className="card p-5">
            <h2 className="mb-1 font-semibold">Fotoğraflar</h2>
            {errors.image_ids && <p className="mb-2 text-xs text-red-600">{errors.image_ids}</p>}
            <div className="mt-3">
              <ImageUploader value={form.image_ids} onChange={(v) => set('image_ids', v)} />
            </div>
          </section>

          <section className="card grid gap-4 p-5 sm:grid-cols-3">
            <Field label="Satış fiyatı (₺) *" error={errors.price}>
              <input className="input tabular-nums" inputMode="decimal" value={form.price} onChange={(e) => set('price', e.target.value.replace(',', '.').replace(/[^\d.]/g, ''))} placeholder="0" />
            </Field>
            <Field label="Eski fiyat (₺)" error={errors.old_price} hint={off > 0 ? `%${off} indirim olarak gösterilir` : 'İndirim göstermek için'}>
              <input className="input tabular-nums" inputMode="decimal" value={form.old_price} onChange={(e) => set('old_price', e.target.value.replace(',', '.').replace(/[^\d.]/g, ''))} placeholder="—" />
            </Field>
            <Field
              label="Stok adedi"
              error={errors.stock}
              hint={form.variants.length ? 'Renk varyantı eklendiği için stok renklerden otomatik toplanır' : undefined}
            >
              <input
                className="input tabular-nums disabled:bg-cream disabled:text-ink-mute"
                type="number"
                min="0"
                disabled={form.variants.length > 0}
                value={form.variants.length ? form.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0) : form.stock}
                onChange={(e) => set('stock', e.target.value)}
              />
            </Field>
          </section>

          <section className="card p-5">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="font-semibold">Renk varyantları</h2>
              <button
                type="button"
                onClick={() => set('variants', [...form.variants, { color: '', barcode: '', image_ids: [], stock: 0 }])}
                className="btn-outline btn-sm"
              >
                + Renk ekle
              </button>
            </div>
            <p className="mb-3 text-xs text-ink-mute">Her rengin kendi barkodu, stoğu ve en fazla 8 fotoğrafı olur; fiyat tüm renklerde aynıdır.</p>
            {errors.variants && <p className="mb-2 text-xs text-red-600">{errors.variants}</p>}
            {form.variants.length === 0 ? (
              <p className="rounded-xl border border-dashed border-cream-line p-4 text-center text-xs text-ink-mute">
                Renk eklenmemiş — ürün tek bir stok olarak satılır.
              </p>
            ) : (
              <div className="space-y-4">
                {form.variants.map((v, i) => (
                  <div key={i} className="rounded-xl border border-cream-line p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        className="input min-w-[100px] flex-1 py-2 text-sm"
                        placeholder="Ör. Kırmızı"
                        value={v.color}
                        onChange={(e) => set('variants', form.variants.map((x, idx) => (idx === i ? { ...x, color: e.target.value } : x)))}
                      />
                      <input
                        className="input min-w-[100px] flex-1 py-2 text-sm"
                        placeholder="Ör. 8690000123456"
                        value={v.barcode || ''}
                        onChange={(e) => set('variants', form.variants.map((x, idx) => (idx === i ? { ...x, barcode: e.target.value } : x)))}
                      />
                      <input
                        className="input w-20 shrink-0 py-2 text-sm tabular-nums"
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => set('variants', form.variants.map((x, idx) => (idx === i ? { ...x, stock: e.target.value } : x)))}
                      />
                      <button
                        type="button"
                        onClick={() => set('variants', form.variants.filter((_, idx) => idx !== i))}
                        className="shrink-0 rounded-lg p-2 text-ink-mute hover:bg-red-50 hover:text-red-600"
                        aria-label="Rengi kaldır"
                      >
                        <CloseIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3">
                      <ImageUploader
                        compact
                        max={8}
                        value={v.image_ids || []}
                        onChange={(ids) => set('variants', form.variants.map((x, idx) => (idx === i ? { ...x, image_ids: ids } : x)))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="card space-y-4 p-5">
            <Toggle checked={form.is_active} onChange={(v) => set('is_active', v)} label="Sitede yayında" description="Kapalıysa müşteriler göremez" />
            <Toggle checked={form.is_featured} onChange={(v) => set('is_featured', v)} label="Öne çıkan ürün" description="Ana sayfada gösterilir" />
          </section>

          <section className="card space-y-4 p-5">
            <Field label="Kategori" error={errors.category_id}>
              <select className="input" value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
                <option value="">Kategorisiz</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Ürün kodu (SKU)" error={errors.sku}>
              <input className="input" value={form.sku} onChange={(e) => set('sku', e.target.value)} placeholder="Ör. KP-001" />
            </Field>
            <div>
              <span className="label">Etiketler</span>
              <div className="flex flex-wrap gap-1.5 rounded-xl border border-cream-line bg-white p-2">
                {form.tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 rounded-full bg-cream-deep px-2.5 py-1 text-xs">
                    #{t}
                    <button type="button" onClick={() => set('tags', form.tags.filter((x) => x !== t))}><CloseIcon className="h-3 w-3" /></button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                  onBlur={addTag}
                  placeholder={form.tags.length ? '' : 'Ör. hediye, yeni sezon'}
                  className="min-w-[100px] flex-1 bg-transparent px-1 text-sm outline-none"
                />
              </div>
              <span className="mt-1 block text-xs text-ink-mute">Enter ile ekleyin. Sitede aramada kullanılır.</span>
            </div>
            <Field label="Bağlantı (URL)" error={errors.slug} hint={`/urun/${form.slug || '…'}`}>
              <input className="input" value={form.slug} onChange={(e) => { setSlugTouched(true); set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')); }} />
            </Field>
          </section>

          {productId && (
            <button type="button" onClick={remove} className="btn w-full text-red-600 hover:bg-red-50">
              <TrashIcon className="h-4 w-4" /> Ürünü sil
            </button>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-cream-line bg-white/90 backdrop-blur lg:left-64">
        <div className="flex items-center justify-end gap-3 px-4 py-3 sm:px-6">
          {dirty && <span className="mr-auto text-xs text-ink-mute">Kaydedilmemiş değişiklikler var</span>}
          <Link href="/admin/urunler" className="btn-outline btn-sm py-2.5">Vazgeç</Link>
          <button disabled={saving} className="btn-primary btn-sm px-6 py-2.5">{saving ? 'Kaydediliyor…' : productId ? 'Kaydet' : 'Ürünü ekle'}</button>
        </div>
      </div>
    </form>
  );
}
