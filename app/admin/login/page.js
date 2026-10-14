'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/client-api';

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api('/api/auth/login', { method: 'POST', body: { email, password } });
      const next = sp.get('next');
      router.replace(next && next.startsWith('/admin') ? next : '/admin');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-full max-w-sm animate-fade-up">
      <p className="eyebrow mb-3">Yönetim Paneli</p>
      <h1 className="h-display text-5xl">Hoş geldiniz</h1>
      <p className="mt-2 text-sm text-ink-mute">Mağazanızı yönetmek için giriş yapın.</p>

      <div className="mt-8 space-y-4">
        <label className="block">
          <span className="label">E-posta</span>
          <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="input py-3" />
        </label>
        <label className="block">
          <span className="label">Şifre</span>
          <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input py-3" />
        </label>
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <button disabled={loading} className="btn-primary w-full py-3.5">{loading ? 'Giriş yapılıyor…' : 'Giriş yap'}</button>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16">
        <Suspense>
          <LoginForm />
        </Suspense>
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
