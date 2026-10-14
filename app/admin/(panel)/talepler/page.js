'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Empty, PageHeader, Pagination, Spinner, useAdminUI } from '@/components/admin/AdminUI';
import { CloseIcon, SearchIcon, TrashIcon, WhatsAppIcon } from '@/components/Icons';
import { api } from '@/lib/client-api';
import { INQUIRY_STATUS, formatPrice, imageUrl, normalizePhone, timeAgo } from '@/lib/utils';

const TABS = [['all', 'Tümü'], ...Object.entries(INQUIRY_STATUS).map(([k, v]) => [k, v.label])];

function Inquiries() {
  const sp = useSearchParams();
  const { notify, confirm } = useAdminUI();
  const [filters, setFilters] = useState({ status: sp.get('status') || 'all', q: '', page: 1 });
  const [qInput, setQInput] = useState('');
  const [data, setData] = useState(null);
  const [active, setActive] = useState(null);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    const u = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && u.set(k, v));
    try {
      setData(await api(`/api/admin/inquiries?${u}`));
    } catch (e) {
      notify(e.message, 'error');
    }
  }, [filters, notify]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.q === qInput ? f : { ...f, q: qInput, page: 1 })), 350);
    return () => clearTimeout(t);
  }, [qInput]);
  useEffect(() => setNote(active?.admin_note || ''), [active?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = async (inq, body) => {
    try {
      const saved = await api(`/api/admin/inquiries/${inq.id}`, { method: 'PATCH', body });
      setData((d) => ({ ...d, items: d.items.map((x) => (x.id === saved.id ? saved : x)) }));
      if (active?.id === saved.id) setActive(saved);
      notify('Talep güncellendi');
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const remove = async (inq) => {
    if (!(await confirm({ title: `#${inq.id} silinsin mi?`, danger: true, confirmText: 'Sil' }))) return;
    try {
      await api(`/api/admin/inquiries/${inq.id}`, { method: 'DELETE' });
      setActive(null);
      notify('Talep silindi');
      load();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  return (
    <>
      <PageHeader title="WhatsApp Talepleri" subtitle="Müşterilerin sepetten WhatsApp’a gönderdiği siparişler. Talep no, mesajın başında yazar." />

      <div className="card mb-4 flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-cream p-1">
          {TABS.map(([v, l]) => (
            <button key={v} onClick={() => setFilters((f) => ({ ...f, status: v, page: 1 }))} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${filters.status === v ? 'bg-white font-semibold shadow-sm' : 'text-ink-mute'}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
          <input value={qInput} onChange={(e) => setQInput(e.target.value)} placeholder="Talep no, isim, ürün…" className="input pl-9" />
        </div>
      </div>

      {!data ? (
        <div className="flex justify-center py-20 text-ink-mute"><Spinner className="h-8 w-8" /></div>
      ) : data.items.length === 0 ? (
        <Empty title="Talep yok" text="Müşteriler sepetten WhatsApp butonuna bastığında talepler burada listelenir." />
      ) : (
        <div className="card divide-y divide-cream-line">
          {data.items.map((inq) => (
            <button key={inq.id} onClick={() => setActive(inq)} className="flex w-full items-center gap-4 p-4 text-left hover:bg-cream/50">
              <div className="flex -space-x-3">
                {inq.items.slice(0, 3).map((it, i) => (
                  <span key={i} className="h-12 w-10 overflow-hidden rounded-lg border-2 border-white bg-cream-deep">
                    {it.image_id && <img src={imageUrl(it.image_id)} alt="" className="h-full w-full object-cover" />}
                  </span>
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold">
                  #{inq.id} <span className="truncate font-normal text-ink-mute">{inq.customer_name || 'İsimsiz müşteri'}</span>
                </p>
                <p className="truncate text-xs text-ink-mute">
                {inq.items.map((i) => `${i.qty}× ${i.name}${i.color ? ` (${i.color})` : ''}`).join(', ')}
              </p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="font-semibold tabular-nums">{formatPrice(inq.total)}</p>
                <p className="text-xs text-ink-mute">{timeAgo(inq.created_at)}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${INQUIRY_STATUS[inq.status].cls}`}>{INQUIRY_STATUS[inq.status].label}</span>
            </button>
          ))}
        </div>
      )}
      {data && <Pagination page={data.page} pages={data.pages} onChange={(p) => setFilters((f) => ({ ...f, page: p }))} />}

      {active && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={() => setActive(null)} />
          <aside className="relative flex h-full w-full max-w-md animate-slide-in flex-col bg-white">
            <div className="flex items-start justify-between border-b border-cream-line p-5">
              <div>
                <p className="h-display text-3xl">Talep #{active.id}</p>
                <p className="text-xs text-ink-mute">{new Date(active.created_at).toLocaleString('tr-TR')}</p>
              </div>
              <button onClick={() => setActive(null)} className="btn-ghost -mr-2"><CloseIcon /></button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              <div>
                <p className="label">Durum</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(INQUIRY_STATUS).map(([k, v]) => (
                    <button key={k} onClick={() => update(active, { status: k })} className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${active.status === k ? 'border-ink bg-ink text-cream' : 'border-cream-line hover:border-ink/30'}`}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <p><span className="text-ink-mute">Müşteri:</span> {active.customer_name || '—'}</p>
                {active.customer_phone && <p><span className="text-ink-mute">Telefon:</span> {active.customer_phone}</p>}
                {active.note && <p className="rounded-xl bg-cream p-3"><span className="text-ink-mute">Not:</span> {active.note}</p>}
              </div>

              <ul className="divide-y divide-cream-line rounded-xl border border-cream-line">
                {active.items.map((it, i) => (
                  <li key={i} className="flex items-center gap-3 p-3">
                    <span className="h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-cream-deep">
                      {it.image_id && <img src={imageUrl(it.image_id)} alt="" className="h-full w-full object-cover" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <a href={`/urun/${it.slug}`} target="_blank" className="block truncate text-sm font-semibold hover:underline">{it.name}</a>
                      {it.color && (
                        <p className="text-xs text-ink-mute">Renk: {it.color}{it.barcode ? ` · Barkod: ${it.barcode}` : ''}</p>
                      )}
                      <p className="text-xs text-ink-mute">{it.qty} × {formatPrice(it.price)}</p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{formatPrice(it.qty * it.price)}</span>
                  </li>
                ))}
                <li className="flex justify-between p-3 text-sm font-semibold">
                  <span>Toplam ({active.item_count} adet)</span>
                  <span className="tabular-nums">{formatPrice(active.total)}</span>
                </li>
              </ul>

              <div>
                <p className="label">Satıcı notu (sadece siz görürsünüz)</p>
                <textarea className="input min-h-[90px]" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ör. Kapıda ödeme, Cuma teslim" />
                <button onClick={() => update(active, { admin_note: note })} disabled={note === (active.admin_note || '')} className="btn-outline btn-sm mt-2">Notu kaydet</button>
              </div>
            </div>

            <div className="flex gap-2 border-t border-cream-line p-4">
              {active.customer_phone && (
                <a href={`https://wa.me/${normalizePhone(active.customer_phone)}?text=${encodeURIComponent(`Merhaba${active.customer_name ? ' ' + active.customer_name : ''}, #${active.id} numaralı talebiniz hakkında yazıyorum.`)}`} target="_blank" rel="noopener noreferrer" className="btn-wa btn-sm flex-1 py-2.5">
                  <WhatsAppIcon className="h-4 w-4" /> Müşteriye yaz
                </a>
              )}
              <button onClick={() => remove(active)} className="btn btn-sm py-2.5 text-red-600 hover:bg-red-50"><TrashIcon className="h-4 w-4" /> Sil</button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export default function InquiriesPage() {
  return (
    <Suspense>
      <Inquiries />
    </Suspense>
  );
}
