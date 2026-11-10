import { CartProvider } from '@/components/shop/CartProvider';
import Header from '@/components/shop/Header';
import Footer from '@/components/shop/Footer';
import CartDrawer from '@/components/shop/CartDrawer';
import FloatingUI from '@/components/shop/FloatingUI';
import { getImageMeta, getSettings, listCategories } from '@/lib/queries';
import { ogImage } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const s = await getSettings();
  const previewImageId = s.logo_image_id || s.hero_image_id;
  const preview = previewImageId ? ogImage(previewImageId, await getImageMeta(previewImageId), s.store_name) : undefined;
  const previewImage = preview ? [preview] : undefined;
  return {
    title: { default: `${s.store_name}${s.tagline ? ' — ' + s.tagline : ''}`, template: `%s · ${s.store_name}` },
    description: s.hero_subtitle || s.tagline || undefined,
    openGraph: { siteName: s.store_name, type: 'website', locale: 'tr_TR', images: previewImage },
    twitter: { card: 'summary_large_image', images: previewImage },
  };
}

export default async function ShopLayout({ children }) {
  const [settings, categories] = await Promise.all([getSettings(), listCategories()]);
  return (
    <CartProvider settings={settings}>
      <div className="min-h-screen bg-cream text-ink">
        <Header settings={settings} categories={categories} />
        <main className="min-h-[60vh]">{children}</main>
        <Footer settings={settings} categories={categories} />
        <CartDrawer />
        <FloatingUI />
      </div>
    </CartProvider>
  );
}
