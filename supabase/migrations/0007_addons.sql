-- ============================================================
-- 0007 — الخدمات الإضافية للأماكن
-- ============================================================

create table addons (
  id       uuid primary key default gen_random_uuid(),
  place_id uuid not null references places(id) on delete cascade,
  name_ar  text not null,
  description_ar text,
  image_url text,
  price    bigint not null,
  -- نفس النوع المستخدم في services — محرّك تسعير واحد يخدم الاثنين
  pricing_mode pricing_mode not null default 'per_booking',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint addons_price_nonneg check (price >= 0)
);

create index addons_place_idx on addons(place_id) where is_active;
