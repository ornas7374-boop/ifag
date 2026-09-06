-- ============================================================
-- 0009 — الطلبات (الخدمات المتنقلة)
-- منفصلة عن الحجوزات لأن دورة حياتها مختلفة تمامًا.
-- ============================================================

create table delivery_addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  label_ar    text,
  city_id     uuid not null references cities(id) on delete restrict,
  district_id uuid references districts(id) on delete set null,
  address_text text not null,
  latitude    double precision not null,
  longitude   double precision not null,
  notes       text,
  created_at  timestamptz not null default now(),
  constraint delivery_addr_lat_valid check (latitude between -90 and 90),
  constraint delivery_addr_lng_valid check (longitude between -180 and 180)
);
create index delivery_addresses_user_idx on delivery_addresses(user_id);

create table orders (
  id          uuid primary key default gen_random_uuid(),
  reference   text not null unique,
  customer_id uuid not null references profiles(id) on delete restrict,
  host_id     uuid not null references profiles(id) on delete restrict,
  status         order_status   not null default 'pending',
  payment_status payment_status not null default 'unpaid',

  -- نسخة من العنوان وقت الطلب: لو عدّل العميل عنوانه المحفوظ لاحقًا
  -- لا يتغيّر عنوان طلب سابق تم توصيله فعلًا
  delivery_address_id uuid references delivery_addresses(id) on delete set null,
  delivery_address_snapshot jsonb,
  service_at timestamptz,

  services_amount   bigint not null default 0,
  delivery_fee      bigint not null default 0,
  extra_fees        bigint not null default 0,
  discount_amount   bigint not null default 0,
  commission_rate   numeric(5,4) not null default 0,
  commission_amount bigint not null default 0,
  total_amount      bigint not null default 0,
  currency          char(3) not null default 'SAR',
  quote_snapshot    jsonb not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint orders_amounts_nonneg check (
    services_amount >= 0 and delivery_fee >= 0 and extra_fees >= 0
    and discount_amount >= 0 and commission_amount >= 0 and total_amount >= 0
  ),
  constraint orders_commission_rate_valid check (
    commission_rate >= 0 and commission_rate <= 1
  )
);

create index orders_customer_idx on orders(customer_id, created_at desc);
create index orders_host_idx     on orders(host_id, created_at desc);
create index orders_status_idx   on orders(status);

create table order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references orders(id) on delete cascade,
  service_id uuid not null references services(id) on delete restrict,
  -- الاسم والسعر منسوخان وقت الطلب حتى لا يغيّرهما تعديل لاحق على الخدمة
  title_ar     text not null,
  unit_price   bigint not null,
  pricing_mode pricing_mode not null,
  quantity     numeric(10,2) not null default 1,
  line_total   bigint not null,
  options      jsonb not null default '{}',
  service_at   timestamptz,
  constraint order_items_amounts_nonneg check (unit_price >= 0 and line_total >= 0),
  constraint order_items_quantity_positive check (quantity > 0)
);
create index order_items_order_idx on order_items(order_id);
