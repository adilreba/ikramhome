'use client';

import { useCart } from './CartProvider';
import { CheckIcon, WhatsAppIcon } from '@/components/Icons';
import { formatPrice } from '@/lib/utils';
import { waLink } from '@/lib/whatsapp';

// Sağ altta sabit WhatsApp kutusu + "sepete eklendi" bildirimi
export default function FloatingUI() {
  const { count, total, setOpen, settings, toast, bump } = useCart();

  const onClick = () => {
    if (count > 0) setOpen(true);
    else window.open(waLink(settings.whatsapp_number, 'Merhaba, ürünleriniz hakkında bilgi almak istiyorum.'), '_blank');
  };

  return (
    <>
      <button
        onClick={onClick}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 animate-pulse-ring items-center justify-center rounded-full bg-wa text-white shadow-[0_18px_40px_-12px_rgba(18,140,75,.65)] transition hover:-translate-y-0.5 hover:animate-none hover:bg-wa-dark sm:bottom-7 sm:right-7"
        aria-label={count > 0 ? `Siparişi gönder (${formatPrice(total, settings.currency)})` : 'WhatsApp’tan yazın'}
        title={count > 0 ? `Siparişi gönder — ${formatPrice(total, settings.currency)}` : 'WhatsApp’tan yazın'}
      >
        <span key={bump} className="relative flex h-full w-full animate-pop items-center justify-center">
          <WhatsAppIcon className="h-7 w-7" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-wa-dark">
              {count}
            </span>
          )}
        </span>
      </button>

      <div
        aria-live="polite"
        className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 sm:bottom-8 ${toast ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}
      >
        <div className="flex items-center gap-3 rounded-full bg-ink py-2.5 pl-3 pr-2 text-sm text-cream shadow-lift">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-wa text-white">
            <CheckIcon className="h-4 w-4" />
          </span>
          <span className="max-w-[52vw] truncate">{toast}</span>
          <button onClick={() => setOpen(true)} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/20">
            Sepete git
          </button>
        </div>
      </div>
    </>
  );
}
