import ProductForm from '@/components/admin/ProductForm';

export default function EditProductPage({ params }) {
  return <ProductForm productId={params.id} />;
}
