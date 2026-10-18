'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ChevronDownIcon } from '@/components/Icons';

const SORTS = [
  ['new', 'En yeni'],
  ['featured', 'Öne çıkanlar'],
  ['popular', 'En çok bakılan'],
  ['price_asc', 'Fiyat: artan'],
  ['price_desc', 'Fiyat: azalan'],
];

export default function ShopFilters({ categories, current }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const [min, setMin] = useState(current.min);
  const [max, setMax] = useState(current.max);
  const [open, setOpen] = useState(false);

  const go = (patch) => {
    const next = { ...current, ...patch, page: '' };
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) if (v && !(k === 'sort' && v === 'new')) u.set(k, v);
    start(() => router.push(`${pathname}${u.toString() ? `?${u}` : ''}`, { scroll: false }));
  };

  const activeSort = SORTS.find(([v]) => v === current.sort)?.[1] || SORTS[0][1];
  const hasPriceFilter = Boolean(current.min || current.max);

  return (
    <div className={`space-y-3 transition ${pending ? 'opacity-60' : ''}`}>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <button onClick={() => go({ category: '' })} className={`chip ${!current.category ? 'chip-active' : ''}`}>Tümü</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => go({ category: c.slug })} className={`chip ${current.category === c.slug ? 'chip-active' : ''}`}>
            {c.name}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between border-y border-cream-line py-2.5">
        <button onClick={() => setOpen((o) => !o)} className={`chip ${open || hasPriceFilter ? 'chip-active' : ''}`}>
          Fiyat ve sıralama
          <ChevronDownIcon className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} />
        </button>
        <span className="text-xs text-ink-mute">{activeSort}</span>
      </div>

      {open && (
        <div className="card flex animate-fade-up flex-col gap-3 p-4 md:flex-row md:items-center">
          <form onSubmit={(e) => { e.preventDefault(); go({ min, max }); }} className="flex items-center gap-2">
            <input value={min} onChange={(e) => setMin(e.target.value.replace(/[^\d]/g, ''))} inputMode="numeric" placeholder="En az ₺" className="input w-0 min-w-0 flex-1 rounded-full sm:w-28 sm:flex-none" />
            <span className="shrink-0 text-ink-mute">–</span>
            <input value={max} onChange={(e) => setMax(e.target.value.replace(/[^\d]/g, ''))} inputMode="numeric" placeholder="En çok ₺" className="input w-0 min-w-0 flex-1 rounded-full sm:w-28 sm:flex-none" />
            <button className="btn-outline btn-sm shrink-0 py-2.5">Uygula</button>
          </form>

          <label className="flex items-center gap-2 text-sm md:ml-auto">
            <span className="text-ink-mute">Sırala</span>
            <select value={current.sort} onChange={(e) => go({ sort: e.target.value })} className="input w-auto rounded-full py-2 pr-8">
              {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
