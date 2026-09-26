-- ============================================================
-- 0012 — سياسات أمان مستوى الصف (RLS)
--
-- إخفاء صفحات لوحة التحكم ليس حماية. هذه هي الحماية الفعلية:
-- حتى لو استدعى أحدهم واجهة Supabase مباشرة بمفتاح anon، لن يرى
-- إلا ما تسمح به هذه السياسات.
--
-- مبدأ حاكم: العميل لا يملك صلاحية INSERT على المبالغ.
-- إنشاء الحجوزات والطلبات يمر عبر دوال security definer تعيد حساب
-- السعر في الخادم — فلا يمكن للمتصفح أن يفرض مبلغًا.
-- ============================================================

alter table profiles           enable row level security;
alter table places             enable row level security;
alter table place_amenities    enable row level security;
alter table place_availability_rules enable row level security;
alter table services           enable row level security;
alter table delivery_zones     enable row level security;
alter table addons             enable row level security;
alter table bookings           enable row level security;
alter table booking_addons     enable row level security;
alter table orders             enable row level security;
alter table order_items        enable row level security;
alter table delivery_addresses enable row level security;
alter table favorites          enable row level security;
alter table reviews            enable row level security;
alter table listing_images     enable row level security;
alter table payments           enable row level security;
alter table commissions        enable row level security;
alter table notifications      enable row level security;
alter table platform_settings  enable row level security;

-- الجداول المرجعية: قراءة عامة، تعديل للإدارة فقط
alter table cities     enable row level security;
alter table districts  enable row level security;
alter table categories enable row level security;
alter table amenities  enable row level security;

create policy "reference readable by all" on cities     for select using (true);
create policy "reference readable by all" on districts  for select using (true);
create policy "reference readable by all" on categories for select using (true);
create policy "reference readable by all" on amenities  for select using (true);

create policy "admin manages cities"     on cities     for all using (is_admin()) with check (is_admin());
create policy "admin manages districts"  on districts  for all using (is_admin()) with check (is_admin());
create policy "admin manages categories" on categories for all using (is_admin()) with check (is_admin());
create policy "admin manages amenities"  on amenities  for all using (is_admin()) with check (is_admin());

-- ── الملفات الشخصية ──
create policy "own profile readable" on profiles
  for select using (id = auth.uid() or is_admin());
create policy "own profile updatable" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy "admin manages profiles" on profiles
  for all using (is_admin()) with check (is_admin());

-- ── الأماكن ──
-- العامة ترى المنشور فقط. صاحب المكان يرى ويدير ما يملكه هو.
create policy "published places are public" on places
  for select using (status = 'published' or host_id = auth.uid() or is_admin());
create policy "host inserts own places" on places
  for insert with check (host_id = auth.uid() and auth_role() = 'host');
create policy "host updates own places" on places
  for update using (host_id = auth.uid()) with check (host_id = auth.uid());
create policy "admin manages places" on places
  for all using (is_admin()) with check (is_admin());

create policy "place amenities follow place" on place_amenities
  for select using (
    exists (select 1 from places p where p.id = place_id
            and (p.status = 'published' or p.host_id = auth.uid() or is_admin()))
  );
create policy "host manages place amenities" on place_amenities
  for all using (exists (select 1 from places p where p.id = place_id and p.host_id = auth.uid()))
  with check (exists (select 1 from places p where p.id = place_id and p.host_id = auth.uid()));

create policy "availability follows place" on place_availability_rules
  for select using (true);
create policy "host manages availability" on place_availability_rules
  for all using (exists (select 1 from places p where p.id = place_id and p.host_id = auth.uid()))
  with check (exists (select 1 from places p where p.id = place_id and p.host_id = auth.uid()));

-- ── الخدمات ──
create policy "published services are public" on services
  for select using (status = 'published' or host_id = auth.uid() or is_admin());
create policy "host inserts own services" on services
  for insert with check (host_id = auth.uid() and auth_role() = 'host');
create policy "host updates own services" on services
  for update using (host_id = auth.uid()) with check (host_id = auth.uid());
create policy "admin manages services" on services
  for all using (is_admin()) with check (is_admin());

create policy "delivery zones readable" on delivery_zones for select using (true);
create policy "host manages delivery zones" on delivery_zones
  for all using (exists (select 1 from services s where s.id = service_id and s.host_id = auth.uid()))
  with check (exists (select 1 from services s where s.id = service_id and s.host_id = auth.uid()));

-- ── الإضافات ──
create policy "addons readable" on addons for select using (true);
create policy "host manages addons" on addons
  for all using (exists (select 1 from places p where p.id = place_id and p.host_id = auth.uid()))
  with check (exists (select 1 from places p where p.id = place_id and p.host_id = auth.uid()));

-- ── الحجوزات ──
-- طرفا الحجز فقط: العميل وصاحب المكان.
create policy "booking visible to its parties" on bookings
  for select using (
    customer_id = auth.uid() or host_id = auth.uid() or is_admin()
  );

-- ★ العميل لا يُدخل حجوزات مباشرة ★
-- لا توجد سياسة INSERT للعميل عن قصد: الإنشاء يمر عبر دالة
-- create_booking (security definer) التي تعيد حساب المبلغ في الخادم.
-- هكذا يستحيل على المتصفح تحديد السعر.
create policy "host inserts own blocks" on bookings
  for insert with check (
    host_id = auth.uid()
    and source in ('host_block', 'maintenance')
    and total_amount = 0
  );

-- صاحب المكان يحدّث الحالة وأوقات الدخول/الخروج و available_again_at.
create policy "host updates own bookings" on bookings
  for update using (host_id = auth.uid()) with check (host_id = auth.uid());
-- العميل يستطيع الإلغاء فقط (يُقيَّد أكثر بمُشغّل يمنع تعديل المبالغ).
create policy "customer updates own booking" on bookings
  for update using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy "admin manages bookings" on bookings
  for all using (is_admin()) with check (is_admin());

create policy "booking addons visible to parties" on booking_addons
  for select using (
    exists (select 1 from bookings b where b.id = booking_id
            and (b.customer_id = auth.uid() or b.host_id = auth.uid() or is_admin()))
  );

-- ── الطلبات ──
create policy "order visible to its parties" on orders
  for select using (customer_id = auth.uid() or host_id = auth.uid() or is_admin());
create policy "host updates own orders" on orders
  for update using (host_id = auth.uid()) with check (host_id = auth.uid());
create policy "customer updates own order" on orders
  for update using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy "admin manages orders" on orders
  for all using (is_admin()) with check (is_admin());

create policy "order items visible to parties" on order_items
  for select using (
    exists (select 1 from orders o where o.id = order_id
            and (o.customer_id = auth.uid() or o.host_id = auth.uid() or is_admin()))
  );

-- ── عناوين التوصيل ──
create policy "own addresses" on delivery_addresses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── المفضلة ──
create policy "own favorites" on favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── التقييمات ──
create policy "visible reviews are public" on reviews
  for select using (is_hidden = false or author_id = auth.uid() or is_admin());
create policy "author writes own review" on reviews
  for insert with check (author_id = auth.uid());
create policy "author updates own review" on reviews
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "admin moderates reviews" on reviews
  for all using (is_admin()) with check (is_admin());

-- ── الصور ──
create policy "listing images readable" on listing_images for select using (true);
create policy "host manages place images" on listing_images
  for all using (
    (place_id   is not null and exists (select 1 from places   p where p.id = place_id   and p.host_id = auth.uid()))
    or (service_id is not null and exists (select 1 from services s where s.id = service_id and s.host_id = auth.uid()))
  )
  with check (
    (place_id   is not null and exists (select 1 from places   p where p.id = place_id   and p.host_id = auth.uid()))
    or (service_id is not null and exists (select 1 from services s where s.id = service_id and s.host_id = auth.uid()))
  );

-- ── المدفوعات والعمولات ──
-- تُكتب من الخادم فقط (webhook بمفتاح service_role يتجاوز RLS).
create policy "payments visible to parties" on payments
  for select using (
    is_admin()
    or exists (select 1 from bookings b where b.id = booking_id
               and (b.customer_id = auth.uid() or b.host_id = auth.uid()))
    or exists (select 1 from orders o where o.id = order_id
               and (o.customer_id = auth.uid() or o.host_id = auth.uid()))
  );

create policy "host sees own commissions" on commissions
  for select using (host_id = auth.uid() or is_admin());

-- ── الإشعارات ──
create policy "own notifications" on notifications
  for select using (user_id = auth.uid());
create policy "mark own notification read" on notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── إعدادات المنصة ──
-- قراءة عامة (الهوية تُعرض لكل زائر)، تعديل للإدارة فقط.
create policy "settings readable by all" on platform_settings for select using (true);
create policy "admin updates settings" on platform_settings
  for update using (is_admin()) with check (is_admin());
