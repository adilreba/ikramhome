import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center text-ink">
      <p className="eyebrow mb-3">404</p>
      <h1 className="h-display text-5xl sm:text-6xl">Aradığınız sayfa bulunamadı</h1>
      <p className="mt-4 text-ink-mute">Ürün kaldırılmış veya bağlantı değişmiş olabilir.</p>
      <Link href="/urunler" className="btn-primary mt-8">Ürünlere göz at</Link>
    </div>
  );
}
