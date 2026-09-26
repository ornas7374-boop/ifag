-- ============================================================
-- 0005 — الأماكن
-- كل المبالغ bigint بوحدة الهللة (1 ريال = 100 هللة).
-- ============================================================

create table places (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  host_id     uuid not null references profiles(id) on delete restrict,
  title_ar    text not null,
  description_ar text not null default '',
  place_kind  place_kind not null,
  status      listing_status not null default 'draft',

  city_id      uuid not null references cities(id) on delete restrict,
  district_id  uuid references districts(id) on delete set null,
  address_text text not null default '',
  latitude     double precision not null,
  longitude    double precision not null,

  capacity_min int not null default 1,
  capacity_max int not null default 1,
  check_in_time  time not null default '16:00',
  check_out_time time not null default '12:00',

  -- دقائق التنظيف/التجهيز بين حجزين. تُشتق منها القيمة الافتراضية
  -- لـ available_again_at عند إنشاء الحجز.
  turnaround_minutes int not null default 0,

  -- سعر واحد على الأقل مطلوب. null يعني أن نوع الحجز هذا غير متاح.
  price_per_hour  bigint,
  price_per_day   bigint,
  price_per_night bigint,

  rating_avg   numeric(2,1) not null default 0,
  rating_count int not null default 0,

  cancellation_policy_ar text not null default '',
  rules_ar text,

  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint places_capacity_valid check (capacity_max >= capacity_min and capacity_min >= 1),
  constraint places_prices_nonneg check (
    coalesce(price_per_hour, 0)  >= 0 and
    coalesce(price_per_day, 0)   >= 0 and
    coalesce(price_per_night, 0) >= 0
  ),
  constraint places_has_a_price check (
    price_per_hour is not null or price_per_day is not null or price_per_night is not null
  ),
  constraint places_turnaround_nonneg check (turnaround_minutes >= 0),
  constraint places_lat_valid check (latitude between -90 and 90),
  constraint places_lng_valid check (longitude between -180 and 180)
);

create index places_status_idx  on places(status) where status = 'published';
create index places_city_idx    on places(city_id);
create index places_host_idx    on places(host_id);
create index places_kind_idx    on places(place_kind);
create index places_rating_idx  on places(rating_avg desc);

create table place_amenities (
  place_id   uuid not null references places(id) on delete cascade,
  amenity_id uuid not null references amenities(id) on delete cascade,
  primary key (place_id, amenity_id)
);

-- أوقات يحجبها صاحب المكان يدويًا خارج نظام الحجوزات
-- (ملاحظة: الحجب الفعلي يتم كصف في bookings بمصدر host_block
--  حتى يشارك في قيد منع التداخل — انظر 0008).
create table place_availability_rules (
  id         uuid primary key default gen_random_uuid(),
  place_id   uuid not null references places(id) on delete cascade,
  weekday    smallint,
  opens_at   time,
  closes_at  time,
  is_closed  boolean not null default false,
  constraint availability_weekday_valid check (weekday is null or weekday between 0 and 6)
);
create index place_availability_place_idx on place_availability_rules(place_id);
