'use client';

import ProductGallery from './ProductGallery';
import { useProductVariant } from './ProductVariantContext';

export default function ProductMediaGallery({ product }) {
  const { selectedVariant } = useProductVariant();
  const images = selectedVariant?.image_ids?.length ? selectedVariant.image_ids : product.image_ids;
  return <ProductGallery images={images} name={product.name} />;
}
