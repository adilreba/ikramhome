import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import AdminShell from '@/components/admin/AdminShell';
import { getSettings } from '@/lib/queries';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Yönetim Paneli', robots: { index: false, follow: false } };

export default async function PanelLayout({ children }) {
  const { userId } = await auth();
  if (!userId) redirect('/admin/login');
  const user = await currentUser();
  const admin = {
    email: user?.primaryEmailAddress?.emailAddress || '',
    name: user?.fullName || user?.firstName || user?.username || 'Yönetici',
  };
  const settings = await getSettings();
  return (
    <AdminShell admin={admin} storeName={settings.store_name}>
      {children}
    </AdminShell>
  );
}
