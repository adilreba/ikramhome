'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { AdminUIProvider } from './AdminUI';
import { BoxIcon, CloseIcon, ExternalIcon, GridIcon, InboxIcon, LogoutIcon, MenuIcon, SettingsIcon, TagIcon } from '@/components/Icons';
import { api } from '@/lib/client-api';

const NAV = [
  { href: '/admin', label: 'Genel Bakış', icon: GridIcon, exact: true },
  { href: '/admin/urunler', label: 'Ürünler', icon: BoxIcon },
  { href: '/admin/kategoriler', label: 'Kategoriler', icon: TagIcon },
  { href: '/admin/talepler', label: 'WhatsApp Talepleri', icon: InboxIcon, badge: true },
  { href: '/admin/ayarlar', label: 'Ayarlar', icon: SettingsIcon },
];

export default function AdminShell({ admin, storeName, children }) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => setOpen(false), [pathname]);

  // Yeni talep sayısını periyodik kontrol et
  useEffect(() => {
    let alive = true;
    const load = () =>
      api('/api/admin/inquiries?status=new&limit=1')
        .then((d) => alive && setNewCount(d.total))
        .catch(() => {});
    load();
    const t = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [pathname]);

  const logout = () => signOut({ redirectUrl: '/admin/login' });

  const isActive = (item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-6 py-6">
        <p className="h-display text-2xl text-white">{storeName}</p>
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">Yönetim Paneli</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
              isActive(item) ? 'bg-white/15 font-semibold text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
            {item.badge && newCount > 0 && (
              <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-clay-dark">{newCount}</span>
            )}
          </Link>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/15 p-3">
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white">
          <ExternalIcon className="h-[18px] w-[18px]" /> Siteyi görüntüle
        </a>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white">
          <LogoutIcon className="h-[18px] w-[18px]" /> Çıkış yap
        </button>
        <p className="truncate px-3 pt-2 text-[11px] text-white/50">{admin.email}</p>
      </div>
    </div>
  );

  return (
    <AdminUIProvider>
      <div className="min-h-screen bg-[#F4F1EC]">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-gradient-to-b from-clay to-clay-dark lg:block">{sidebar}</aside>

        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-72 bg-gradient-to-b from-clay to-clay-dark">
              <button onClick={() => setOpen(false)} className="absolute right-3 top-5 p-2 text-white/80"><CloseIcon /></button>
              {sidebar}
            </aside>
          </div>
        )}

        <div className="lg:pl-64">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-cream-line bg-[#F4F1EC]/90 px-4 backdrop-blur lg:hidden">
            <button onClick={() => setOpen(true)} className="btn-ghost -ml-2"><MenuIcon className="h-6 w-6" /></button>
            <span className="h-display text-xl">{storeName}</span>
            {newCount > 0 && (
              <Link href="/admin/talepler" className="ml-auto rounded-full bg-clay px-2.5 py-1 text-xs font-bold text-white">{newCount} yeni</Link>
            )}
          </header>
          <main className="px-4 py-8 sm:px-8">{children}</main>
        </div>
      </div>
    </AdminUIProvider>
  );
}
