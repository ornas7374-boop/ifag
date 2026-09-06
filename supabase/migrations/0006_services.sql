-- ============================================================
-- 0006 — الخدمات المتنقلة
-- ============================================================

create table services (
  id       uuid primary key default gen_random_uuid(),
  slug     text not null unique,
  host_id  uuid not null references profiles(id) on delete restrict,
  title_ar text not null,
  description_ar text not null default '',
  service_kind service_kind not null,
  status   listing_status not null default 'draft',

  city_id uuid not null references cities(id) on delete restrict,

  price        bigint not null,
  pricing_mode pricing_mode not null,

  min_quantity  int not null default 1,
  max_quantity  int,
  unit_label_ar text not null default 'وحدة',

  requires_delivery boolean not null default false,
  requires_setup    boolean not null default false,
  setup_duration_minutes int,

  delivery_strategy  delivery_fee_strategy not null default 'free',
  delivery_fee       bigint not null default 0,
  free_delivery_over bigint,
  max_distance_km    int,

  rating_avg   numeric(2,1) not null default 0,
  rating_count int not null default 0,

  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint services_price_nonneg    check (price >= 0),
  constraint services_delivery_nonneg check (delivery_fee >= 0),
  constraint services_quantity_valid  check (
    min_quantity >= 1 and (max_quantity is null or max_quantity >= min_quantity)
  ),
  -- استراتيجية غير مجانية بلا رسوم = خطأ إعداد صامت يكلّف المزوّد مالًا
  constraint services_fee_matches_strategy check (
    delivery_strategy = 'free' or delivery_fee > 0
  ),
  constraint services_setup_duration check (
    requires_setup = false or setup_duration_minutes is not null
  )
);

create index services_status_idx on services(status) where status = 'published';
create index services_city_idx   on services(city_id);
create index services_host_idx   on services(host_id);
create index services_kind_idx   on services(service_kind);

-- مناطق التوصيل ورسومها حين تكون الاستراتيجية per_city أو per_district
create table delivery_zones (
  id          uuid primary key default gen_random_uuid(),
  service_id  uuid not null references services(id) on delete cascade,
  city_id     uuid references cities(id) on delete cascade,
  district_id uuid references districts(id) on delete cascade,
  fee         bigint not null default 0,
  min_order   bigint not null default 0,
  constraint delivery_zone_fee_nonneg check (fee >= 0),
  -- منطقة إمّا مدينة أو حيّ، لا الاثنان ولا لا شيء
  constraint delivery_zone_one_target check (num_nonnulls(city_id, district_id) = 1)
);
create index delivery_zones_service_idx on delivery_zones(service_id);
