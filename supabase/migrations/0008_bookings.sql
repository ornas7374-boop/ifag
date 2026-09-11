-- ============================================================
-- 0008 — الحجوزات ومنع الحجز المزدوج
--
-- ★ أهم ملف في المخطط بأكمله ★
--
-- المبدأ الأساسي: هناك نافذتان زمنيتان مختلفتان لكل حجز، والخلط
-- بينهما هو أسهل خطأ يقع فيه هذا النوع من الأنظمة:
--
--   1. النافذة المتعاقد عليها  [booking_start, booking_end)
--      عقد مالي. لا تتغيّر أبدًا بعد التأكيد. منها يُحسب السعر.
--
--   2. نافذة الحجب  [preparation_start ?? booking_start,
--                    available_again_at ?? booking_end)
--      واقع تشغيلي. يتحكم فيها صاحب المكان. هي وحدها ما يحجب التقويم.
--
-- مثال المتطلبات حرفيًا:
--   حجز 4:00م – 8:00م. خرج العميل 7:00م.
--   صاحب المكان يحدد available_again_at = 7:30م.
--   ⇒ نافذة الحجب تصبح [4:00, 7:30) فيُقبل حجز جديد يبدأ 7:30م.
--   ⇒ booking_start/booking_end تبقيان 4:00–8:00 دون مساس،
--      فلا يُنقص المبلغ لمجرد أن العميل خرج مبكرًا.
--
-- القيد يعمل في الاتجاه الآخر أيضًا: لو احتاج المكان تنظيفًا وحدّد
-- الصاحب 9:00م، حُجب حتى 9:00م.
-- ============================================================

create table bookings (
  id          uuid primary key default gen_random_uuid(),
  reference   text not null unique,
  place_id    uuid not null references places(id) on delete restrict,
  -- null فقط لصفوف الحجب التي ينشئها صاحب المكان للصيانة
  customer_id uuid references profiles(id) on delete restrict,
  host_id     uuid not null references profiles(id) on delete restrict,

  source booking_source not null default 'customer',
  status booking_status not null default 'pending',
  payment_status payment_status not null default 'unpaid',

  -- ── النافذة المتعاقد عليها — أساس التسعير والسجل ──
  booking_start timestamptz not null,
  booking_end   timestamptz not null,

  -- ── أوقات تشغيلية — واقع ما حدث، لا تُستخدم في التسعير إطلاقًا ──
  preparation_start  timestamptz,
  actual_check_in    timestamptz,
  actual_check_out   timestamptz,
  -- يحدده صاحب المكان. قد يكون أبكر من booking_end (خروج مبكر)
  -- أو أمتد بعده (تنظيف). null ⇒ يُستخدم booking_end.
  available_again_at timestamptz,

  rate_unit rate_unit not null,
  units     numeric(10,2) not null default 1,
  guests    int not null default 1,

  -- كل المبالغ بالهللة
  base_amount       bigint not null default 0,
  addons_amount     bigint not null default 0,
  discount_amount   bigint not null default 0,
  commission_rate   numeric(5,4) not null default 0,
  commission_amount bigint not null default 0,
  total_amount      bigint not null default 0,
  currency          char(3) not null default 'SAR',

  -- نسخة من المدخلات وقواعد التسعير وقت الحجز، حتى يبقى الفاتورة
  -- قابلة لإعادة الاشتقاق بعد تغيير الأسعار مستقبلًا
  quote_snapshot jsonb not null default '{}',

  hold_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- ★ نافذة الحجب — عمود محسوب، لا يمكن كتابته يدويًا ★
  -- الحدود نصف مفتوحة [) عن قصد: حجز يبدأ في نفس لحظة
  -- available_again_at لا يُعد متداخلًا. لو كانت [] لاستحال
  -- الحجز المتتالي في المنصة كلها.
  blocking_period tstzrange generated always as (
    tstzrange(
      coalesce(preparation_start, booking_start),
      coalesce(available_again_at, booking_end),
      '[)'
    )
  ) stored,

  -- النافذة المتعاقد عليها كمدى، للتقارير فقط — لا تُستشار للإتاحة
  contracted_period tstzrange generated always as (
    tstzrange(booking_start, booking_end, '[)')
  ) stored,

  constraint bookings_window_valid check (booking_end > booking_start),

  -- يمنع نافذة حجب معكوسة أو فارغة (مثلًا إفراج قبل بداية التجهيز)
  constraint bookings_blocking_window_valid check (
    coalesce(available_again_at, booking_end)
      > coalesce(preparation_start, booking_start)
  ),

  constraint bookings_checkout_after_checkin check (
    actual_check_out is null or actual_check_in is null
    or actual_check_out >= actual_check_in
  ),

  constraint bookings_customer_required check (
    source <> 'customer' or customer_id is not null
  ),

  constraint bookings_guests_positive check (guests >= 1),
  constraint bookings_amounts_nonneg check (
    base_amount >= 0 and addons_amount >= 0 and discount_amount >= 0
    and commission_amount >= 0 and total_amount >= 0
  ),
  constraint bookings_commission_rate_valid check (
    commission_rate >= 0 and commission_rate <= 1
  )
);

comment on column bookings.booking_end is
  'نهاية الفترة المتعاقد عليها. تُحفظ للتسعير والسجل ولا تُقصَّر أبدًا حتى لو خرج العميل مبكرًا.';
comment on column bookings.available_again_at is
  'نهاية حجب التقويم، يحددها صاحب المكان. قد تسبق booking_end (خروج مبكر) أو تليها (تنظيف). الحدود نصف مفتوحة: يجوز أن يبدأ الحجز التالي في نفس اللحظة تمامًا.';

-- ============================================================
-- ★ القيد الذي يمنع الحجز المزدوج ★
--
-- الفحص البرمجي (SELECT ثم INSERT) لا يكفي: تحت عزل READ COMMITTED
-- يرى طلبان متزامنان أن الوقت شاغر فيُدخلان معًا. Supabase يعمل بمجمّع
-- اتصالات، ونقرتان على جوال بشبكة ضعيفة كافيتان لإحداثها.
--
-- قيد الاستبعاد يفرضه محرّك التخزين على كل كاتب: التطبيق، ودوال RPC،
-- وسطر psql يدوي، وأي أداة إدارية مستقبلية. لا يمكن نسيانه.
--
-- الحالات غير النشطة (ملغى/مكتمل) خارج الشرط، فلا تحجب التقويم.
-- ============================================================
alter table bookings
  add constraint bookings_no_overlap
  exclude using gist (
    place_id        with =,
    blocking_period with &&
  )
  where (status in ('pending', 'confirmed', 'checked_in', 'checked_out'));

create index bookings_place_period_idx on bookings using gist (place_id, blocking_period);
create index bookings_host_idx     on bookings(host_id, booking_start desc);
create index bookings_customer_idx on bookings(customer_id, booking_start desc);
create index bookings_status_idx   on bookings(status);
create index bookings_hold_idx     on bookings(hold_expires_at) where status = 'pending';

-- الإضافات المختارة في الحجز، بأسعارها وقت الحجز (لا تتأثر بتغيير لاحق)
create table booking_addons (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references bookings(id) on delete cascade,
  addon_id    uuid not null references addons(id) on delete restrict,
  name_ar     text not null,
  unit_price  bigint not null,
  pricing_mode pricing_mode not null,
  quantity    numeric(10,2) not null default 1,
  line_total  bigint not null,
  constraint booking_addons_amounts_nonneg check (unit_price >= 0 and line_total >= 0)
);
create index booking_addons_booking_idx on booking_addons(booking_id);

-- ============================================================
-- القيمة الافتراضية لـ available_again_at من مدة تجهيز المكان.
-- تُطبَّق عند الإدخال فقط؛ بعدها يملكها صاحب المكان.
-- ============================================================
create or replace function set_default_available_again_at()
returns trigger
language plpgsql
-- search_path مثبّت: بدونه يستطيع دور ذو صلاحية إنشاء في مخطط يسبق
-- public أن يزرع دالة بنفس الاسم فتُنفَّذ بدل الأصلية.
set search_path = public
as $$
declare
  turnaround int;
begin
  if new.available_again_at is null then
    select turnaround_minutes into turnaround from places where id = new.place_id;
    new.available_again_at :=
      new.booking_end + make_interval(mins => coalesce(turnaround, 0));
  end if;
  return new;
end;
$$;

create trigger bookings_set_default_release
  before insert on bookings
  for each row execute function set_default_available_again_at();

-- ============================================================
-- فحص الإتاحة — للمعاينة في الواجهة قبل الإرسال.
-- ليس ضمانة؛ الضمانة هي قيد الاستبعاد أعلاه.
-- ============================================================
create or replace function check_place_availability(
  p_place_id uuid,
  p_start    timestamptz,
  p_end      timestamptz
)
returns boolean
language sql
stable
set search_path = public
as $$
  select not exists (
    select 1
      from bookings b
     where b.place_id = p_place_id
       and b.status in ('pending', 'confirmed', 'checked_in', 'checked_out')
       and b.blocking_period && tstzrange(p_start, p_end, '[)')
  );
$$;
