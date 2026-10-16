import Link from 'next/link';
import { ClockIcon, InstagramIcon, PhoneIcon, PinIcon, WhatsAppIcon } from '@/components/Icons';
import { normalizePhone } from '@/lib/utils';

export default function Footer({ settings, categories }) {
  const ig = settings.instagram ? settings.instagram.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '') : '';
  return (
    <footer className="mt-24 bg-ink text-cream/80">
      <div className="container-x grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="h-display text-4xl uppercase tracking-[0.06em] text-cream">{settings.store_name}</p>
          {settings.tagline && <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream/60">{settings.tagline}</p>}
          <a
            href={`https://wa.me/${normalizePhone(settings.whatsapp_number)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-wa mt-7"
          >
            <WhatsAppIcon /> WhatsApp’tan yazın
          </a>
        </div>

        <div className="md:col-span-3">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-clay/90">Kategoriler</p>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/urunler" className="transition hover:text-cream">Tüm Ürünler</Link></li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/urunler?category=${c.slug}`} className="transition hover:text-cream">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-clay/90">İletişim</p>
          <ul className="space-y-3 text-sm">
            {settings.address && <li className="flex gap-3"><PinIcon className="mt-0.5 h-4 w-4 shrink-0" />{settings.address}</li>}
            {settings.phone && (
              <li className="flex gap-3">
                <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="transition hover:text-cream">{settings.phone}</a>
              </li>
            )}
            {settings.working_hours && <li className="flex gap-3"><ClockIcon className="mt-0.5 h-4 w-4 shrink-0" />{settings.working_hours}</li>}
            {ig && (
              <li className="flex gap-3">
                <InstagramIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <a href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer" className="transition hover:text-cream">@{ig}</a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-xs text-cream/40 sm:flex-row">
          <span>© {new Date().getFullYear()} {settings.store_name}. Tüm hakları saklıdır.</span>
          <span>Siparişler WhatsApp üzerinden alınır.</span>
        </div>
      </div>
    </footer>
  );
}
