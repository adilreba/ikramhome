import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { getAdmin } from '@/lib/auth';
import { getSettings } from '@/lib/queries';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Yönetim Paneli', robots: { index: false, follow: false } };

export default async function PanelLayout({ children }) {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');
  const settings = await getSettings();
  return (
    <AdminShell admin={admin} storeName={settings.store_name}>
      {children}
    </AdminShell>
  );
}
