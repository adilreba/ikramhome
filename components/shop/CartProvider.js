'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'vitrin_cart_v1';

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((i) => i && i.product_id && i.qty > 0) : [];
  } catch {
    return [];
  }
}

const lineKey = (i) => `${i.product_id}:${i.variant_id || 0}`;

export function CartProvider({ settings, children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [bump, setBump] = useState(0);
  const loaded = useRef(false);
  const toastTimer = useRef(null);

  // Sepeti tarayıcıdan yükle ve güncel fiyat/stok bilgisiyle eşitle
  useEffect(() => {
    const stored = readStorage();
    setItems(stored);
    loaded.current = true;
    if (!stored.length) return;
    fetch(`/api/products/lookup?ids=${stored.map((i) => i.product_id).join(',')}`)
      .then((r) => r.json())
      .then((res) => {
        if (!res.ok) return;
        const fresh = new Map(res.data.map((p) => [p.id, p]));
        const findVariant = (p, variantId) => p.variants.find((v) => v.id === variantId && v.is_active);
        const resync = (i) => {
          const p = fresh.get(i.product_id);
          if (!p) return null;
          const variant = i.variant_id ? findVariant(p, i.variant_id) : null;
          if (i.variant_id && !variant) return null;
          return { ...i, name: p.name, slug: p.slug, price: p.price, image_id: p.cover_image_id, color: variant?.color ?? i.color };
        };
        setItems((cur) => cur.map(resync).filter(Boolean));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  // Diğer sekmelerle senkron
  useEffect(() => {
    const onStorage = (e) => e.key === STORAGE_KEY && setItems(readStorage());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const add = useCallback(
    (product, qty = 1, variant = null) => {
      const itemKey = { product_id: product.id, variant_id: variant?.id || null };
      setItems((cur) => {
        const found = cur.find((i) => lineKey(i) === lineKey(itemKey));
        if (found) return cur.map((i) => (lineKey(i) === lineKey(itemKey) ? { ...i, qty: Math.min(i.qty + qty, 99) } : i));
        return [
          ...cur,
          {
            product_id: product.id,
            variant_id: variant?.id || null,
            color: variant?.color || null,
            name: product.name,
            slug: product.slug,
            price: product.price,
            image_id: product.cover_image_id,
            qty,
          },
        ];
      });
      setBump((b) => b + 1);
      showToast(`“${product.name}” sepete eklendi`);
    },
    [showToast]
  );

  const setQty = useCallback((id, qty, variantId = null) => {
    const key = lineKey({ product_id: id, variant_id: variantId });
    setItems((cur) => (qty <= 0 ? cur.filter((i) => lineKey(i) !== key) : cur.map((i) => (lineKey(i) === key ? { ...i, qty: Math.min(qty, 99) } : i))));
  }, []);

  const remove = useCallback((id, variantId = null) => {
    const key = lineKey({ product_id: id, variant_id: variantId });
    setItems((cur) => cur.filter((i) => lineKey(i) !== key));
  }, []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const total = items.reduce((s, i) => s + i.qty * Number(i.price), 0);
    return {
      items,
      count,
      total,
      open,
      setOpen,
      add,
      setQty,
      remove,
      clear,
      settings,
      toast,
      bump,
      has: (id, variantId = null) => items.some((i) => lineKey(i) === lineKey({ product_id: id, variant_id: variantId })),
    };
  }, [items, open, add, setQty, remove, clear, settings, toast, bump]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart, CartProvider içinde kullanılmalı');
  return ctx;
}
