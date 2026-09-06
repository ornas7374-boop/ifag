-- ============================================================
-- 0002 — الأنواع المعدودة (Enums)
--
-- هذه الأنواع هي ما يمنع تكرار الكود رغم أن الأماكن والخدمات
-- في جدولين منفصلين: طريقة التسعير واحدة يقرأها محرّك تسعير واحد.
-- ============================================================

create type user_role as enum ('customer', 'host', 'admin');

create type listing_status as enum (
  'draft', 'pending', 'published', 'rejected', 'suspended'
);

create type place_kind   as enum ('kashta', 'camp', 'wild');
create type service_kind as enum ('setup', 'product', 'labor');

-- وحدة الحجز للأماكن
create type rate_unit as enum ('hour', 'day', 'night');

-- ★ مشتركة بين addons و services ★
-- إضافة طريقة تسعير جديدة مستقبلًا = قيمة هنا + حالة واحدة في محرّك التسعير.
create type pricing_mode as enum (
  'fixed',
  'per_booking',
  'per_hour',
  'per_day',
  'per_night',
  'per_person',
  'per_unit',
  'per_km'
);

create type delivery_fee_strategy as enum (
  'free', 'flat', 'per_city', 'per_district', 'per_distance'
);

create type booking_status as enum (
  'pending', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled'
);

-- مصدر الحجز. host_block يسمح لصاحب المكان بحجب أوقات للصيانة
-- باستخدام نفس الجدول ونفس قيد منع التداخل — لا حاجة لجدول منفصل
-- لا يستطيع المشاركة في القيد.
create type booking_source as enum ('customer', 'host_block', 'maintenance');

create type order_status as enum (
  'pending', 'confirmed', 'preparing', 'out_for_delivery',
  'delivered', 'completed', 'cancelled'
);

create type payment_status as enum ('unpaid', 'paid', 'failed', 'refunded');

create type charge_line_kind as enum (
  'base', 'addon', 'delivery', 'discount', 'commission', 'fee'
);
