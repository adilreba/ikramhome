import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="grid min-h-screen overflow-x-hidden lg:grid-cols-2">
      <div className="flex min-w-0 items-center justify-center px-6 py-16">
        <div className="w-full min-w-0 max-w-sm animate-fade-up">
          <p className="eyebrow mb-3">Yönetim Paneli</p>
          <h1 className="h-display text-5xl">Hoş geldiniz</h1>
          <p className="mt-2 text-sm text-ink-mute">Mağazanızı yönetmek için giriş yapın.</p>
          <div className="mt-8">
            <SignIn
              routing="path"
              path="/admin/login"
              fallbackRedirectUrl="/admin"
              appearance={{ elements: { card: 'shadow-none p-0', rootBox: 'w-full' } }}
            />
          </div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 30% 30%, #B5603A 0, transparent 45%), radial-gradient(circle at 75% 70%, #25D366 0, transparent 40%)' }} />
        <div className="relative flex h-full flex-col justify-end p-14 text-cream">
          <p className="h-display max-w-md text-5xl leading-tight">Ürünlerinizi yükleyin, siparişler WhatsApp’a gelsin.</p>
          <p className="mt-4 max-w-sm text-sm text-cream/60">Ürün, kategori, talep ve mağaza ayarlarınızın tamamı tek panelde.</p>
        </div>
      </div>
    </div>
  );
}
