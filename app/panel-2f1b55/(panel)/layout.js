import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { SignOutButton } from '@clerk/nextjs';
import AdminShell from '@/components/admin/AdminShell';
import { getSettings } from '@/lib/queries';
import { isAdminEmail } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Yönetim Paneli', robots: { index: false, follow: false } };

export default async function PanelLayout({ children }) {
  const { userId } = await auth();
  if (!userId) redirect('/panel-2f1b55/login');
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress || '';

  if (!isAdminEmail(email)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-6 text-center">
        <p className="h-display text-3xl">Yetkiniz yok</p>
        <p className="max-w-sm text-sm text-ink-mute">{email} hesabının yönetim paneline erişim yetkisi bulunmuyor.</p>
        <SignOutButton redirectUrl="/panel-2f1b55/login">
          <button className="btn-outline">Çıkış yap</button>
        </SignOutButton>
      </div>
    );
  }

  const admin = {
    email,
    name: user?.fullName || user?.firstName || user?.username || 'Yönetici',
  };
  const settings = await getSettings();
  return (
    <AdminShell admin={admin} storeName={settings.store_name}>
      {children}
    </AdminShell>
  );
}
