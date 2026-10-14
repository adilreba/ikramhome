-- Vitrin – Neon PostgreSQL şeması
-- Bu dosya `npm run db:setup` ile otomatik çalıştırılır. Tekrar çalıştırmak güvenlidir.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL DEFAULT 'Yönetici',
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data       BYTEA NOT NULL,
  mime       TEXT NOT NULL,
  size       INTEGER NOT NULL,
  width      INTEGER,
  height     INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image_id    UUID REFERENCES images(id) ON DELETE SET NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  sku         TEXT,
  price       NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  old_price   NUMERIC(12,2) CHECK (old_price IS NULL OR old_price >= 0),
  stock       INTEGER NOT NULL DEFAULT 0,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  tags        TEXT[] NOT NULL DEFAULT '{}',
  views       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_active_idx   ON products(is_active, created_at DESC);

CREATE TABLE IF NOT EXISTS product_images (
  id         SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_id   UUID    NOT NULL REFERENCES images(id)   ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (product_id, image_id)
);
CREATE INDEX IF NOT EXISTS product_images_product_idx ON product_images(product_id, sort_order);

-- Renk varyantları: her rengin kendi barkodu ve stok adedi olur, fiyat üründen miras alınır
CREATE TABLE IF NOT EXISTS product_variants (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color       TEXT NOT NULL,
  barcode     TEXT,
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS product_variants_product_idx ON product_variants(product_id, sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS product_variants_barcode_idx ON product_variants(barcode) WHERE barcode IS NOT NULL;

-- Müşterinin WhatsApp butonuna basarak gönderdiği talepler (sepet)
CREATE TABLE IF NOT EXISTS inquiries (
  id             SERIAL PRIMARY KEY,
  customer_name  TEXT,
  customer_phone TEXT,
  note           TEXT,
  items          JSONB NOT NULL,
  item_count     INTEGER NOT NULL DEFAULT 0,
  total          NUMERIC(12,2) NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'new'
                 CHECK (status IN ('new','contacted','sold','cancelled')),
  admin_note     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS inquiries_status_idx ON inquiries(status, created_at DESC);

CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
