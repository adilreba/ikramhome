import { z } from 'zod';

const money = z.coerce.number({ invalid_type_error: 'Geçerli bir tutar girin.' }).min(0, 'Tutar negatif olamaz.').max(99_999_999);
const optionalText = (max) =>
  z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? null : v), z.string().trim().max(max).nullable().optional());
const uuid = z.string().uuid('Geçersiz görsel kimliği.');

export const variantSchema = z.object({
  color: z.string().trim().min(1, 'Renk adı gerekli.').max(40),
  barcode: optionalText(60),
  image_ids: z.array(uuid).max(8, 'Bir renk için en fazla 8 fotoğraf ekleyebilirsiniz.').default([]),
  stock: z.coerce.number().int().min(0).max(1_000_000).default(0),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Ürün adı en az 2 karakter olmalı.').max(160),
  slug: optionalText(90),
  description: optionalText(5000),
  sku: optionalText(60),
  price: money,
  old_price: z.preprocess((v) => (v === '' || v === null || v === undefined ? null : v), money.nullable()),
  stock: z.coerce.number().int().min(0).max(1_000_000).default(0),
  category_id: z.preprocess((v) => (v === '' || v === null || v === undefined ? null : v), z.coerce.number().int().positive().nullable()),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  image_ids: z.array(uuid).max(12, 'En fazla 12 fotoğraf ekleyebilirsiniz.').default([]),
  variants: z.array(variantSchema).max(30, 'En fazla 30 renk ekleyebilirsiniz.').default([]),
});

export const productPatchSchema = z.object({
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  price: money.optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Kategori adı en az 2 karakter olmalı.').max(80),
  slug: optionalText(90),
  description: optionalText(500),
  image_id: z.preprocess((v) => (v === '' ? null : v), uuid.nullable().optional()),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
  is_active: z.boolean().default(true),
});

export const inquirySchema = z.object({
  customer_name: optionalText(80),
  customer_phone: optionalText(30),
  note: optionalText(500),
  items: z
    .array(
      z.object({
        product_id: z.coerce.number().int().positive(),
        variant_id: z.preprocess((v) => (v === '' || v === null || v === undefined ? null : v), z.coerce.number().int().positive().nullable()),
        qty: z.coerce.number().int().min(1).max(99),
      })
    )
    .min(1, 'Sepetiniz boş.')
    .max(50),
});

export const inquiryPatchSchema = z.object({
  status: z.enum(['new', 'contacted', 'sold', 'cancelled']).optional(),
  admin_note: optionalText(1000),
});

export const settingsSchema = z.object({
  store_name: z.string().trim().min(1, 'Mağaza adı gerekli.').max(60),
  tagline: optionalText(120),
  whatsapp_number: z
    .string()
    .trim()
    .min(10, 'WhatsApp numarasını ülke koduyla girin (ör. 905321234567).')
    .max(20)
    .regex(/^[0-9+\s()-]+$/, 'Sadece rakam girin.'),
  whatsapp_greeting: optionalText(300),
  currency: z.string().trim().min(1).max(4).default('₺'),
  hero_title: optionalText(120),
  hero_subtitle: optionalText(300),
  hero_image_id: z.preprocess((v) => (v === '' ? null : v), uuid.nullable().optional()),
  logo_image_id: z.preprocess((v) => (v === '' ? null : v), uuid.nullable().optional()),
  announcement: optionalText(160),
  about: optionalText(2000),
  address: optionalText(300),
  phone: optionalText(30),
  email: optionalText(120),
  instagram: optionalText(120),
  working_hours: optionalText(120),
  show_stock: z.boolean().default(false),
});

