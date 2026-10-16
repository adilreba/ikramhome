'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PageHeader, Spinner } from '@/components/admin/AdminUI';
import { ArrowRightIcon, EyeIcon, PlusIcon } from '@/components/Icons';
import { api } from '@/lib/client-api';
import { INQUIRY_STATUS, formatPrice, imageUrl, timeAgo } from '@/lib/utils';

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/admin/stats').then(setS).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="card p-6 text-red-700">{error}</p>;
  if (!s) return <div className="flex justify-center py-24 text-ink-mute"><Spinner className="h-8 w-8" /></div>;

  const maxDay = Math.max(1, ...s.daily.map((d) => d.count));
  const conversion = s.inquiries.total ? Math.round((s.inquiries.sold / s.inquiries.total) * 100) : 0;

  return (
    <>
      <PageHeader title="Genel Bakış" subtitle="Mağazanızın son durumu">
        <Link href="/admin/urunler/yeni" className="btn-primary btn-sm py-2.5"><PlusIcon className="h-4 w-4" /> Yeni ürün</Link>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Yeni talepler" value={s.inquiries.new} tone="clay" href="/admin/talepler?status=new" />
        <Stat label="Satışa dönen" value={`${s.inquiries.sold}`} sub={`%${conversion} dönüşüm`} tone="wa" />
        <Stat label="Satış tutarı" value={formatPrice(s.inquiries.sold_total)} sub="“Satıldı” işaretlenenler" tone="wa" />
        <Stat label="Ürün görüntülenme" value={s.total_views.toLocaleString('tr-TR')} tone="clay" />
        <Stat label="Aktif ürün" value={`${s.active_products} / ${s.products}`} tone="wa" href="/admin/urunler" />
        <Stat label="Stokta olmayan" value={s.out_of_stock} tone="red" href="/admin/urunler?status=out_of_stock" />
        <Stat label="Kategori" value={s.categories} tone="clay" href="/admin/kategoriler" />
        <Stat label="Son 30 gün talep" value={s.inquiries.last30} tone="clay" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="card p-5 lg:col-span-3">
          <h2 className="font-semibold">Son 14 gün · WhatsApp talepleri</h2>
          <div className="mt-6 flex h-40 items-end gap-1.5">
            {s.daily.map((d) => (
              <div key={d.day} className="group relative flex flex-1 flex-col items-center justify-end">
                <span className="pointer-events-none absolute -top-6 hidden rounded bg-ink px-1.5 py-0.5 text-[10px] text-cream group-hover:block">{d.count}</span>
                <div className={`w-full rounded-t-md transition ${d.count ? 'bg-clay group-hover:bg-clay-dark' : 'bg-cream-line'}`} style={{ height: `${Math.max(4, (d.count / maxDay) * 100)}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-ink-mute">
            <span>{new Date(s.daily[0]?.day).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
            <span>Bugün</span>
          </div>
        </section>

        <section className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Son talepler</h2>
            <Link href="/admin/talepler" className="text-xs font-semibold text-clay">Tümü →</Link>
          </div>
          <ul className="mt-3 divide-y divide-cream-line">
            {s.recent.length === 0 && <li className="py-6 text-center text-sm text-ink-mute">Henüz talep yok.</li>}
            {s.recent.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-3 text-sm">
                <span className="font-semibold tabular-nums">#{r.id}</span>
                <span className="min-w-0 flex-1 truncate text-ink-mute">{r.customer_name || 'İsimsiz'} · {r.item_count} ürün</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${INQUIRY_STATUS[r.status].cls}`}>{INQUIRY_STATUS[r.status].label}</span>
                <span className="hidden text-xs text-ink-mute sm:block">{timeAgo(r.created_at)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-semibold">En çok görüntülenen ürünler</h2>
          <ul className="mt-3 space-y-3">
            {s.top_viewed.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/urunler/${p.id}`} className="flex items-center gap-3 rounded-xl p-1 hover:bg-cream">
                  <span className="h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-cream-deep">
                    {p.cover_image_id && <img src={imageUrl(p.cover_image_id)} alt="" className="h-full w-full object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                  <span className="flex items-center gap-1 text-xs text-ink-mute"><EyeIcon className="h-3.5 w-3.5" />{p.views}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-5">
          <h2 className="font-semibold">WhatsApp’ta en çok istenenler</h2>
          <ul className="mt-3 space-y-2">
            {s.top_requested.length === 0 && <li className="py-6 text-center text-sm text-ink-mute">Henüz veri yok.</li>}
            {s.top_requested.map((p, i) => (
              <li key={`${p.id}-${i}`} className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm">
                <span className="h-display w-6 text-2xl text-ink-mute">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate">{p.name}</span>
                <span className="text-xs text-ink-mute">{p.qty} adet · {p.inquiries} talep</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

const STAT_TONES = {
  clay: 'border-clay/30 bg-clay-light/40',
  wa: 'border-wa/30 bg-wa/10',
  red: 'border-red-200 bg-red-50',
};

function Stat({ label, value, sub, tone, href }) {
  const body = (
    <div className={`card h-full p-4 transition ${href ? 'hover:border-ink/20' : ''} ${tone ? STAT_TONES[tone] : ''}`}>
      <p className="text-xs text-ink-mute">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-ink-mute">{sub}</p>}
      {href && <ArrowRightIcon className="mt-1 h-3.5 w-3.5 text-ink-mute" />}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}
