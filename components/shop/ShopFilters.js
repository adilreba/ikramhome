'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { SearchIcon } from '@/components/Icons';

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
  const [q, setQ] = useState(current.q);
  const [min, setMin] = useState(current.min);
  const [max, setMax] = useState(current.max);

  useEffect(() => setQ(current.q), [current.q]);

  const go = (patch) => {
    const next = { ...current, ...patch, page: '' };
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) if (v && !(k === 'sort' && v === 'new')) u.set(k, v);
    start(() => router.push(`${pathname}${u.toString() ? `?${u}` : ''}`, { scroll: false }));
  };

  return (
    <div className={`space-y-4 transition ${pending ? 'opacity-60' : ''}`}>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <button onClick={() => go({ category: '' })} className={`chip ${!current.category ? 'chip-active' : ''}`}>Tümü</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => go({ category: c.slug })} className={`chip ${current.category === c.slug ? 'chip-active' : ''}`}>
            {c.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-y border-cream-line py-4 md:flex-row md:items-center">
        <form onSubmit={(e) => { e.preventDefault(); go({ q: q.trim() }); }} className="relative md:w-80">
          <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Bu listede ara…" className="input rounded-full pl-10" />
        </form>

        <form onSubmit={(e) => { e.preventDefault(); go({ min, max }); }} className="flex items-center gap-2">
          <input value={min} onChange={(e) => setMin(e.target.value.replace(/[^\d]/g, ''))} inputMode="numeric" placeholder="En az ₺" className="input w-28 rounded-full" />
          <span className="text-ink-mute">–</span>
          <input value={max} onChange={(e) => setMax(e.target.value.replace(/[^\d]/g, ''))} inputMode="numeric" placeholder="En çok ₺" className="input w-28 rounded-full" />
          <button className="btn-outline btn-sm py-2.5">Uygula</button>
        </form>

        <label className="flex items-center gap-2 text-sm md:ml-auto">
          <span className="text-ink-mute">Sırala</span>
          <select value={current.sort} onChange={(e) => go({ sort: e.target.value })} className="input w-auto rounded-full py-2 pr-8">
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      </div>
    </div>
  );
}
