'use client';

import { useEffect, useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import ImageUploader from '@/components/admin/ImageUploader';
import { Field, PageHeader, Spinner, Toggle, useAdminUI } from '@/components/admin/AdminUI';
import { BoxIcon, ImageIcon, PhoneIcon, SettingsIcon, WhatsAppIcon } from '@/components/Icons';
import { api } from '@/lib/client-api';
import { normalizePhone } from '@/lib/utils';

export default function SettingsPage() {
  const { notify } = useAdminUI();
  const { openUserProfile } = useClerk();
  const [s, setS] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api('/api/admin/settings').then((d) => {
      const clean = {};
      for (const [k, v] of Object.entries(d)) clean[k] = v ?? (typeof v === 'boolean' ? false : '');
      setS(clean);
    }).catch((e) => notify(e.message, 'error'));
  }, [notify]);

  const set = (k, v) => {
    setS((x) => ({ ...x, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const saved = await api('/api/admin/settings', { method: 'PUT', body: s });
      setS((x) => ({ ...x, whatsapp_number: saved.whatsapp_number }));
      notify('Ayarlar kaydedildi');
    } catch (err) {
      setErrors(err.fields || {});
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!s) return <div className="flex justify-center py-24 text-ink-mute"><Spinner className="h-8 w-8" /></div>;

  const input = (k, props = {}) => <input className="input" value={s[k] ?? ''} onChange={(e) => set(k, e.target.value)} {...props} />;

  return (
    <>
      <PageHeader title="Ayarlar" subtitle="Mağaza bilgileri, WhatsApp numarası ve site görünümü" />

      <form onSubmit={save} className="space-y-6">
        <section className="card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-wa/10"><WhatsAppIcon className="h-5 w-5 text-wa" /></span>
            <div>
              <h2 className="font-semibold">WhatsApp</h2>
              <p className="text-xs text-ink-mute">Siparişlerin gideceği numara. Ülke koduyla birlikte yazın.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            <Field
              label="WhatsApp numarası *"
              error={errors.whatsapp_number}
              hint={s.whatsapp_number ? `wa.me/${normalizePhone(s.whatsapp_number)}` : 'Ör. 905321234567'}
              className="sm:w-48 sm:shrink-0"
            >
              {input('whatsapp_number', { inputMode: 'tel', placeholder: '905321234567' })}
            </Field>
            <Field label="Mesajın başlangıç cümlesi" error={errors.whatsapp_greeting} className="flex-1">
              {input('whatsapp_greeting')}
            </Field>
          </div>
          {s.whatsapp_number && (
            <a href={`https://wa.me/${normalizePhone(s.whatsapp_number)}?text=${encodeURIComponent('Test mesajı')}`} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm mt-4 inline-flex">
              Numarayı test et
            </a>
          )}
        </section>

        <section className="card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay-light/60"><BoxIcon className="h-5 w-5 text-clay-dark" /></span>
            <div>
              <h2 className="font-semibold">Mağaza</h2>
              <p className="text-xs text-ink-mute">Sitenin üst kısmında ve başlıklarda görünür.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-5 sm:flex-row">
            <div className="sm:w-[180px] sm:shrink-0">
              <span className="label">Logo (isteğe bağlı)</span>
              <ImageUploader single value={s.logo_image_id ? [s.logo_image_id] : []} onChange={(ids) => set('logo_image_id', ids[0] || null)} />
            </div>
            <div className="flex-1 space-y-4">
              <Field label="Mağaza adı *" error={errors.store_name}>{input('store_name')}</Field>
              <Field label="Slogan" error={errors.tagline}>{input('tagline')}</Field>
              <Field label="Duyuru çubuğu" error={errors.announcement} hint="Boş bırakırsanız gizlenir">{input('announcement')}</Field>
              <Field label="Para birimi" error={errors.currency}>
                <select className="input" value={s.currency} onChange={(e) => set('currency', e.target.value)}>
                  <option value="₺">₺ Türk Lirası</option>
                  <option value="$">$ Dolar</option>
                  <option value="€">€ Euro</option>
                </select>
              </Field>
              <Toggle checked={!!s.show_stock} onChange={(v) => set('show_stock', v)} label="Stok bilgisini göster" description="“Son 2 adet”, “Tükendi” gibi" />
            </div>
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay-light/60"><ImageIcon className="h-5 w-5 text-clay-dark" /></span>
            <div>
              <h2 className="font-semibold">Ana sayfa</h2>
              <p className="text-xs text-ink-mute">Kapak görseli seçmezseniz öne çıkan ürünlerden kolaj oluşturulur.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-5 sm:flex-row">
            <div className="sm:w-[180px] sm:shrink-0">
              <span className="label">Kapak görseli</span>
              <ImageUploader single value={s.hero_image_id ? [s.hero_image_id] : []} onChange={(ids) => set('hero_image_id', ids[0] || null)} />
            </div>
            <div className="flex-1 space-y-4">
              <Field label="Büyük başlık" error={errors.hero_title}>{input('hero_title')}</Field>
              <Field label="Alt metin" error={errors.hero_subtitle}>
                <textarea className="input min-h-[80px]" value={s.hero_subtitle ?? ''} onChange={(e) => set('hero_subtitle', e.target.value)} />
              </Field>
            </div>
          </div>
          <Field label="Hakkımızda" error={errors.about} className="mt-4">
            <textarea className="input min-h-[100px]" value={s.about ?? ''} onChange={(e) => set('about', e.target.value)} />
          </Field>
        </section>

        <section className="card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-wa/10"><PhoneIcon className="h-5 w-5 text-wa-dark" /></span>
            <div>
              <h2 className="font-semibold">İletişim</h2>
              <p className="text-xs text-ink-mute">Sitenin alt kısmında görünür.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Adres" error={errors.address}>{input('address')}</Field>
            <Field label="Telefon" error={errors.phone}>{input('phone')}</Field>
            <Field label="E-posta" error={errors.email}>{input('email')}</Field>
            <Field label="Instagram kullanıcı adı" error={errors.instagram}>{input('instagram', { placeholder: '@magazam' })}</Field>
            <Field label="Çalışma saatleri" error={errors.working_hours}>{input('working_hours')}</Field>
          </div>
        </section>

        <div className="flex justify-end">
          <button disabled={saving} className="btn-primary px-8">{saving ? 'Kaydediliyor…' : 'Ayarları kaydet'}</button>
        </div>
      </form>

      <div className="card mt-10 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-deep"><SettingsIcon className="h-5 w-5 text-ink-mute" /></span>
          <div>
            <h2 className="font-semibold">Hesap ve şifre</h2>
            <p className="text-xs text-ink-mute">Giriş bilgileriniz Clerk üzerinden yönetilir.</p>
          </div>
        </div>
        <button type="button" onClick={() => openUserProfile()} className="btn-outline btn-sm mt-4">
          Hesap ayarlarını aç
        </button>
      </div>
    </>
  );
}
