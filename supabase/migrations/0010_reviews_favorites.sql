-- ============================================================
-- 0010 — المفضلة والتقييمات والصور
--
-- بما أن الأماكن والخدمات في جدولين منفصلين، نستخدم نمط
-- "القوس الحصري" (exclusive arc): عمودان اختياريان بمفاتيح أجنبية
-- حقيقية، وقيد يفرض أن يُملأ واحد فقط.
--
-- البديل الشائع (target_type text + target_id uuid) لا يمكن لـ Postgres
-- فرض مفتاح أجنبي عليه إطلاقًا، فينتج عنه صفوف يتيمة تُكتشف في الإنتاج.
--
-- إضافة نوع ثالث مستقبلًا = عمود جديد + تعديل CHECK، دون المساس
-- بالسلة أو الطلبات أو الحجوزات.
-- ============================================================

create table favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  place_id   uuid references places(id)   on delete cascade,
  service_id uuid references services(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_one_target check (num_nonnulls(place_id, service_id) = 1)
);

create unique index favorites_user_place_uq
  on favorites(user_id, place_id)   where place_id   is not null;
create unique index favorites_user_service_uq
  on favorites(user_id, service_id) where service_id is not null;
create index favorites_user_idx on favorites(user_id);

create table reviews (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null references profiles(id) on delete cascade,
  place_id   uuid references places(id)   on delete cascade,
  service_id uuid references services(id) on delete cascade,
  -- لا يُقيّم إلا من حجز/طلب فعلًا
  booking_id uuid references bookings(id) on delete set null,
  order_id   uuid references orders(id)   on delete set null,
  rating     smallint not null,
  body_ar    text not null default '',
  is_hidden  boolean not null default false,
  created_at timestamptz not null default now(),
  constraint reviews_one_target check (num_nonnulls(place_id, service_id) = 1),
  constraint reviews_rating_range check (rating between 1 and 5)
);

create index reviews_place_idx   on reviews(place_id)   where place_id   is not null;
create index reviews_service_idx on reviews(service_id) where service_id is not null;

create table listing_images (
  id         uuid primary key default gen_random_uuid(),
  place_id   uuid references places(id)   on delete cascade,
  service_id uuid references services(id) on delete cascade,
  storage_path text not null,
  alt_ar     text,
  sort_order int not null default 0,
  is_cover   boolean not null default false,
  created_at timestamptz not null default now(),
  constraint listing_images_one_target check (num_nonnulls(place_id, service_id) = 1)
);
create index listing_images_place_idx   on listing_images(place_id)   where place_id   is not null;
create index listing_images_service_idx on listing_images(service_id) where service_id is not null;
