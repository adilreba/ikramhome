'use client';

import { useCallback, useEffect, useState } from 'react';
import ImageUploader from '@/components/admin/ImageUploader';
import { Empty, Field, PageHeader, Spinner, Toggle, useAdminUI } from '@/components/admin/AdminUI';
import { EditIcon, ExternalIcon, PlusIcon, TrashIcon } from '@/components/Icons';
import { api } from '@/lib/client-api';
import { imageUrl } from '@/lib/utils';

const EMPTY = { name: '', slug: '', description: '', image_id: null, sort_order: 0, is_active: true };

export default function CategoriesPage() {
  const { notify, confirm } = useAdminUI();
  const [list, setList] = useState(null);
  const [editing, setEditing] = useState(null); // null | {…} (id yoksa yeni)
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => api('/api/admin/categories').then(setList).catch((e) => notify(e.message, 'error')), [notify]);
  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    const { id, product_count, total_count, ...body } = editing;
    try {
      await api(id ? `/api/admin/categories/${id}` : '/api/admin/categories', { method: id ? 'PUT' : 'POST', body: { ...body, sort_order: Number(body.sort_order) || 0 } });
      notify(id ? 'Kategori güncellendi' : 'Kategori eklendi');
      setEditing(null);
      load();
    } catch (err) {
      setErrors(err.fields || {});
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c) => {
    const ok = await confirm({
      title: `“${c.name}” silinsin mi?`,
      message: c.total_count ? `Bu kategorideki ${c.total_count} ürün silinmez, “kategorisiz” olarak kalır.` : 'Bu kategori silinecek.',
      danger: true,
      confirmText: 'Sil',
    });
    if (!ok) return;
    try {
      await api(`/api/admin/categories/${c.id}`, { method: 'DELETE' });
      notify('Kategori silindi');
      load();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const toggle = async (c) => {
    const { id, product_count, total_count, ...rest } = c;
    setList((l) => l.map((x) => (x.id === id ? { ...x, is_active: !x.is_active } : x)));
    try {
      await api(`/api/admin/categories/${id}`, { method: 'PUT', body: { ...rest, is_active: !c.is_active } });
    } catch (e) {
      notify(e.message, 'error');
      load();
    }
  };

  return (
    <>
      <PageHeader title="Kategoriler" subtitle="Ürünlerinizi gruplayın; sitede filtre olarak görünür.">
        <button onClick={() => setEditing({ ...EMPTY, sort_order: list?.length || 0 })} className="btn-primary btn-sm py-2.5">
          <PlusIcon className="h-4 w-4" /> Yeni kategori
        </button>
      </PageHeader>

      {!list ? (
        <div className="flex justify-center py-20 text-ink-mute"><Spinner className="h-8 w-8" /></div>
      ) : list.length === 0 ? (
        <Empty title="Henüz kategori yok" text="Ör. Elbise, Ayakkabı, Aksesuar gibi kategoriler oluşturun.">
          <button onClick={() => setEditing({ ...EMPTY })} className="btn-primary">Kategori ekle</button>
        </Empty>
      ) : (
        <div className="card divide-y divide-cream-line">
          {list.map((c) => (
            <div key={c.id} className="flex items-center gap-4 p-4">
              <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-cream-deep">
                {c.image_id && <img src={imageUrl(c.image_id)} alt="" className="h-full w-full object-cover" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{c.name}</p>
                <p className="truncate text-xs text-ink-mute">/{c.slug} · {c.product_count} yayında / {c.total_count} ürün · sıra {c.sort_order}</p>
              </div>
              <button onClick={() => toggle(c)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${c.is_active ? 'bg-wa' : 'bg-cream-line'}`} title="Sitede göster">
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${c.is_active ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
              <a href={`/urunler?category=${c.slug}`} target="_blank" className="hidden rounded-lg p-2 text-ink-mute hover:bg-cream sm:block"><ExternalIcon className="h-4 w-4" /></a>
              <button onClick={() => setEditing({ ...c, description: c.description || '' })} className="rounded-lg p-2 text-ink-mute hover:bg-cream hover:text-ink"><EditIcon className="h-4 w-4" /></button>
              <button onClick={() => remove(c)} className="rounded-lg p-2 text-ink-mute hover:bg-red-50 hover:text-red-600"><TrashIcon className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <form onSubmit={save} className="relative max-h-[92vh] w-full max-w-lg animate-fade-up space-y-4 overflow-y-auto rounded-t-2xl bg-white p-6 sm:rounded-2xl">
            <h2 className="h-display text-3xl">{editing.id ? 'Kategoriyi düzenle' : 'Yeni kategori'}</h2>
            <Field label="Kategori adı *" error={errors.name}>
              <input required autoFocus className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </Field>
            <Field label="Açıklama" error={errors.description}>
              <textarea className="input min-h-[80px]" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Bağlantı (boş bırakılabilir)" error={errors.slug}>
                <input className="input" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="otomatik" />
              </Field>
              <Field label="Sıra" error={errors.sort_order} hint="Küçük olan önce görünür">
                <input type="number" min="0" className="input" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} />
              </Field>
            </div>
            <div>
              <span className="label">Görsel (isteğe bağlı)</span>
              <ImageUploader single value={editing.image_id ? [editing.image_id] : []} onChange={(ids) => setEditing({ ...editing, image_id: ids[0] || null })} />
            </div>
            <Toggle checked={editing.is_active} onChange={(v) => setEditing({ ...editing, is_active: v })} label="Sitede göster" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-outline btn-sm py-2.5" onClick={() => setEditing(null)}>Vazgeç</button>
              <button disabled={saving} className="btn-primary btn-sm px-6 py-2.5">{saving ? 'Kaydediliyor…' : 'Kaydet'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
