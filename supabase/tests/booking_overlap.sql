-- ============================================================
-- اختبار نموذج الوقت ومنع الحجز المزدوج
--
-- يُشغَّل على قاعدة بيانات طبّقت كل ملفات supabase/migrations.
-- كل حالة تطبع PASS أو FAIL.
-- ============================================================

\set ON_ERROR_STOP off
\pset pager off

-- ── بيانات تحضيرية ──
insert into auth.users (id) values
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222')
on conflict (id) do nothing;

insert into profiles (id, role, full_name) values
  ('11111111-1111-1111-1111-111111111111', 'host',     'مضيف'),
  ('22222222-2222-2222-2222-222222222222', 'customer', 'عميل')
on conflict (id) do nothing;

insert into cities (id, slug, name_ar)
values ('33333333-3333-3333-3333-333333333333', '__test-city', 'مدينة اختبار')
on conflict (slug) do nothing;

insert into places (
  id, slug, host_id, title_ar, place_kind, status, city_id,
  latitude, longitude, price_per_night, turnaround_minutes
) values (
  '44444444-4444-4444-4444-444444444444', '__test-place',
  '11111111-1111-1111-1111-111111111111', 'مكان اختبار', 'kashta', 'published',
  '33333333-3333-3333-3333-333333333333', 24.7, 46.7, 100000, 0
);

-- الحجز المرجعي: 4:00م – 8:00م
insert into bookings (
  id, reference, place_id, customer_id, host_id, status, rate_unit,
  booking_start, booking_end
) values (
  '55555555-5555-5555-5555-555555555555', 'REF-001',
  '44444444-4444-4444-4444-444444444444',
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'confirmed', 'hour',
  '2026-06-01 16:00+03', '2026-06-01 20:00+03'
);

\echo ''
\echo '=== 1) حجز متداخل (6:00م-10:00م) يجب أن يُرفض ==='
begin;
insert into bookings (reference, place_id, customer_id, host_id, status, rate_unit,
                      booking_start, booking_end)
values ('REF-002', '44444444-4444-4444-4444-444444444444',
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111', 'confirmed', 'hour',
        '2026-06-01 18:00+03', '2026-06-01 22:00+03');
\echo '^^ متوقع: خطأ 23P01 (exclusion violation) = PASS'
rollback;

\echo ''
\echo '=== 2) حجز متتالٍ يبدأ 8:00م بالضبط يجب أن يُقبل (حدود نصف مفتوحة) ==='
begin;
insert into bookings (reference, place_id, customer_id, host_id, status, rate_unit,
                      booking_start, booking_end)
values ('REF-003', '44444444-4444-4444-4444-444444444444',
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111', 'confirmed', 'hour',
        '2026-06-01 20:00+03', '2026-06-01 23:00+03');
select case when count(*) = 1 then 'PASS — الحجز المتتالي قُبل'
            else 'FAIL' end as result
  from bookings where reference = 'REF-003';
rollback;

\echo ''
\echo '=== 3) ★ الحالة الأساسية من المتطلبات ★'
\echo '    خروج مبكر 7:00م + available_again_at = 7:30م'
\echo '    ⇒ يُقبل حجز جديد يبدأ 7:30م'
\echo '    ⇒ وتبقى الفترة المتعاقد عليها 4:00–8:00 دون تغيير ==='
begin;
update bookings
   set actual_check_out   = '2026-06-01 19:00+03',
       available_again_at = '2026-06-01 19:30+03'
 where id = '55555555-5555-5555-5555-555555555555';

select 'نافذة الحجب الآن: ' || blocking_period::text        as blocking,
       'الفترة المتعاقد عليها: ' || contracted_period::text as contracted
  from bookings where id = '55555555-5555-5555-5555-555555555555';

insert into bookings (reference, place_id, customer_id, host_id, status, rate_unit,
                      booking_start, booking_end)
values ('REF-004', '44444444-4444-4444-4444-444444444444',
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111', 'confirmed', 'hour',
        '2026-06-01 19:30+03', '2026-06-01 23:00+03');

select case
         when (select count(*) from bookings where reference = 'REF-004') = 1
          and (select booking_end from bookings
                where id = '55555555-5555-5555-5555-555555555555')
              = '2026-06-01 20:00+03'::timestamptz
         then 'PASS — الوقت تحرّر مبكرًا والفترة المتعاقد عليها لم تُمس'
         else 'FAIL'
       end as result;
rollback;

\echo ''
\echo '=== 4) تمديد available_again_at للتنظيف يحجب وقتًا إضافيًا ==='
begin;
update bookings set available_again_at = '2026-06-01 21:00+03'
 where id = '55555555-5555-5555-5555-555555555555';
insert into bookings (reference, place_id, customer_id, host_id, status, rate_unit,
                      booking_start, booking_end)
values ('REF-005', '44444444-4444-4444-4444-444444444444',
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111', 'confirmed', 'hour',
        '2026-06-01 20:00+03', '2026-06-01 23:00+03');
\echo '^^ متوقع: خطأ 23P01 = PASS'
rollback;

\echo ''
\echo '=== 5) الحجز الملغى لا يحجب التقويم ==='
begin;
update bookings set status = 'cancelled'
 where id = '55555555-5555-5555-5555-555555555555';
insert into bookings (reference, place_id, customer_id, host_id, status, rate_unit,
                      booking_start, booking_end)
values ('REF-006', '44444444-4444-4444-4444-444444444444',
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111', 'confirmed', 'hour',
        '2026-06-01 16:00+03', '2026-06-01 20:00+03');
select case when count(*) = 1 then 'PASS — نفس الوقت أصبح متاحًا بعد الإلغاء'
            else 'FAIL' end as result
  from bookings where reference = 'REF-006';
rollback;

\echo ''
\echo '=== 6) حجب صاحب المكان للصيانة يمنع حجز العميل ==='
begin;
insert into bookings (reference, place_id, host_id, source, status, rate_unit,
                      booking_start, booking_end)
values ('BLOCK-001', '44444444-4444-4444-4444-444444444444',
        '11111111-1111-1111-1111-111111111111', 'host_block', 'confirmed', 'day',
        '2026-06-05 00:00+03', '2026-06-06 00:00+03');
insert into bookings (reference, place_id, customer_id, host_id, status, rate_unit,
                      booking_start, booking_end)
values ('REF-007', '44444444-4444-4444-4444-444444444444',
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111', 'confirmed', 'day',
        '2026-06-05 10:00+03', '2026-06-05 18:00+03');
\echo '^^ متوقع: خطأ 23P01 = PASS'
rollback;

\echo ''
\echo '=== 7) مدة التجهيز الافتراضية تُطبَّق تلقائيًا عند الإدخال ==='
begin;
update places set turnaround_minutes = 60
 where id = '44444444-4444-4444-4444-444444444444';
insert into bookings (reference, place_id, customer_id, host_id, status, rate_unit,
                      booking_start, booking_end)
values ('REF-008', '44444444-4444-4444-4444-444444444444',
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111', 'confirmed', 'hour',
        '2026-06-10 16:00+03', '2026-06-10 20:00+03');
select case when available_again_at = '2026-06-10 21:00+03'::timestamptz
            then 'PASS — أضيفت 60 دقيقة تجهيز تلقائيًا'
            else 'FAIL: ' || available_again_at::text end as result
  from bookings where reference = 'REF-008';
rollback;

\echo ''
\echo '=== 8) القوس الحصري: المفضلة لا تقبل هدفين ولا صفرًا ==='
begin;
insert into favorites (user_id, place_id, service_id)
values ('22222222-2222-2222-2222-222222222222',
        '44444444-4444-4444-4444-444444444444',
        '44444444-4444-4444-4444-444444444444');
\echo '^^ متوقع: خطأ 23514 (check violation) = PASS'
rollback;

-- ── تنظيف: يجعل الاختبار قابلًا لإعادة التشغيل على نفس القاعدة ──
delete from bookings where place_id = '44444444-4444-4444-4444-444444444444';
delete from favorites where user_id = '22222222-2222-2222-2222-222222222222';
delete from places   where id = '44444444-4444-4444-4444-444444444444';
delete from cities   where id = '33333333-3333-3333-3333-333333333333';
delete from profiles where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222');
delete from auth.users where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222');
