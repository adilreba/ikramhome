import Link from 'next/link';
import { ClockIcon, InstagramIcon, PhoneIcon, PinIcon, WhatsAppIcon } from '@/components/Icons';
import { normalizePhone } from '@/lib/utils';

export default function Footer({ settings, categories }) {
  const ig = settings.instagram ? settings.instagram.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '') : '';
  const catLinks = [{ id: 'all', name: 'Tüm Ürünler', slug: '' }, ...categories];
  const mid = Math.ceil(catLinks.length / 2);
  const catCol1 = catLinks.slice(0, mid);
  const catCol2 = catLinks.slice(mid);
  return (
    <footer className="relative mt-24 overflow-hidden bg-gradient-to-br from-clay via-clay to-clay-dark text-white/85">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 1.5px)', backgroundSize: '22px 22px' }} />
      <div className="container-x relative grid grid-cols-3 gap-x-6 gap-y-10 py-16 md:grid-cols-12">
        <div className="col-span-3 md:col-span-5">
          <p className="h-display text-4xl uppercase tracking-[0.06em] text-white">{settings.store_name}</p>
          {settings.tagline && <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">{settings.tagline}</p>}
          <a
            href={`https://wa.me/${normalizePhone(settings.whatsapp_number)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-wa mt-7"
          >
            <WhatsAppIcon /> WhatsApp’tan yazın
          </a>
        </div>

        <div className="md:col-span-2">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Kategoriler</p>
          <ul className="space-y-2.5 text-sm">
            {catCol1.map((c) => (
              <li key={c.id}>
                <Link href={c.slug ? `/urunler?category=${c.slug}` : '/urunler'} className="transition hover:text-white">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="invisible mb-4 text-[11px] font-semibold uppercase tracking-[0.22em]" aria-hidden="true">Kategoriler</p>
          <ul className="space-y-2.5 text-sm">
            {catCol2.map((c) => (
              <li key={c.id}>
                <Link href={`/urunler?category=${c.slug}`} className="transition hover:text-white">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">İletişim</p>
          <ul className="space-y-3 text-sm">
            {settings.address && <li className="flex gap-3"><PinIcon className="mt-0.5 h-4 w-4 shrink-0" />{settings.address}</li>}
            {settings.phone && (
              <li className="flex gap-3">
                <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="transition hover:text-white">{settings.phone}</a>
              </li>
            )}
            {settings.working_hours && <li className="flex gap-3"><ClockIcon className="mt-0.5 h-4 w-4 shrink-0" />{settings.working_hours}</li>}
            {ig && (
              <li className="flex gap-3">
                <InstagramIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <a href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">@{ig}</a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/15">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-xs text-white/60 sm:flex-row">
          <span>© {new Date().getFullYear()} {settings.store_name}. Tüm hakları saklıdır.</span>
          <span>Siparişler WhatsApp üzerinden alınır.</span>
        </div>
      </div>
    </footer>
  );
}
