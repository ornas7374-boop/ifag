-- ============================================================
-- 0011 — المدفوعات والعمولات والإشعارات وإعدادات المنصة
--
-- لا تُخزَّن بيانات البطاقات إطلاقًا — فقط معرّف العملية من بوابة الدفع.
-- ============================================================

create table payments (
  id         uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete restrict,
  order_id   uuid references orders(id)   on delete restrict,
  amount     bigint not null,
  currency   char(3) not null default 'SAR',
  status     payment_status not null default 'unpaid',
  provider   text not null,
  -- معرّف العملية لدى البوابة. فريد لمنع معالجة نفس الـ webhook مرتين.
  provider_payment_id text,
  raw_webhook jsonb,
  paid_at    timestamptz,
  created_at timestamptz not null default now(),
  constraint payments_one_target check (num_nonnulls(booking_id, order_id) = 1),
  constraint payments_amount_nonneg check (amount >= 0)
);

create unique index payments_provider_ref_uq
  on payments(provider, provider_payment_id) where provider_payment_id is not null;
create index payments_booking_idx on payments(booking_id) where booking_id is not null;
create index payments_order_idx   on payments(order_id)   where order_id   is not null;

create table commissions (
  id         uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  order_id   uuid references orders(id)   on delete cascade,
  host_id    uuid not null references profiles(id) on delete restrict,
  gross_amount bigint not null,
  rate         numeric(5,4) not null,
  commission_amount bigint not null,
  host_net_amount   bigint not null,
  created_at timestamptz not null default now(),
  constraint commissions_one_target check (num_nonnulls(booking_id, order_id) = 1),
  constraint commissions_amounts_nonneg check (
    gross_amount >= 0 and commission_amount >= 0 and host_net_amount >= 0
  )
);
create index commissions_host_idx on commissions(host_id, created_at desc);

create table notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  title_ar   text not null,
  body_ar    text,
  link       text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on notifications(user_id, created_at desc)
  where is_read = false;

-- ============================================================
-- إعدادات المنصة — صف واحد.
--
-- هذا هو الجدول الذي ستقرأه getBrand() في المرحلة 11، فتصبح الهوية
-- والعمولة قابلتين للتعديل من لوحة الإدارة دون إعادة بناء المشروع.
-- ============================================================
create table platform_settings (
  id  boolean primary key default true,
  app_name        text,
  logo_url        text,
  favicon_url     text,
  brand_colors    jsonb,
  font_family     text,
  border_radius   text,
  commission_rate numeric(5,4) not null default 0.10,
  updated_at      timestamptz not null default now(),
  -- يضمن صفًا واحدًا فقط في الجدول
  constraint platform_settings_singleton check (id),
  constraint platform_settings_rate_valid check (commission_rate >= 0 and commission_rate <= 1)
);

insert into platform_settings (id) values (true) on conflict do nothing;
