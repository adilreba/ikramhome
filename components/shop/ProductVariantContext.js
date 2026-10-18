'use client';

import { createContext, useContext, useState } from 'react';

const Ctx = createContext(null);

export function ProductVariantProvider({ product, settings, children }) {
  const activeVariants = (product.variants || []).filter((v) => v.is_active);
  const [variantId, setVariantId] = useState(() => {
    const firstInStock = activeVariants.find((v) => !settings.show_stock || v.stock > 0);
    return (firstInStock || activeVariants[0])?.id ?? null;
  });
  const selectedVariant = activeVariants.find((v) => v.id === variantId) || null;

  return (
    <Ctx.Provider value={{ variantId, setVariantId, selectedVariant, activeVariants }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProductVariant() {
  return useContext(Ctx);
}
