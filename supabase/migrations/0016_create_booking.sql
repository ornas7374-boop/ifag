-- ============================================================
-- 0016 — إنشاء الحجز
--
-- ★ لماذا دالة وليس INSERT مباشرًا من المتصفح ★
-- سياسات 0012 لا تمنح العميل INSERT على bookings عن قصد. لو منحناه
-- إياه لأرسل المبلغ الذي يريده. هذه الدالة تتجاهل أي مبلغ قادم من
-- العميل وتعيد حسابه من جدولي places و addons ومن platform_settings.
--
-- العميل يرسل: أي مكان، أي وحدة، أي تاريخ، كم مدة، كم شخصًا، وأي
-- إضافات. لا يرسل ريالًا واحدًا.
-- ============================================================

create or replace function create_booking(
  p_place_id   uuid,
  p_rate_unit  rate_unit,
  p_date       date,
  p_duration   int,
  p_guests     int,
  p_start_time time  default null,
  p_addon_ids  uuid[] default '{}'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user       uuid := auth.uid();
  v_place      places%rowtype;
  v_start      timestamptz;
  v_end        timestamptz;
  v_rate       bigint;
  v_base       bigint;
  v_addons     bigint := 0;
  v_subtotal   bigint;
  v_total      bigint;
  v_rate_pct   numeric(5,4);
  v_commission bigint;
  v_ref        text;
  v_id         uuid;
  v_hours      numeric := 0;
  v_days       numeric := 0;
  v_nights     numeric := 0;
  a            record;
  v_line       bigint;
begin
  if v_user is null then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
  end if;

  if p_duration < 1 then
    raise exception 'INVALID_DURATION' using errcode = '22023';
  end if;

  select * into v_place from places where id = p_place_id;
  if not found or v_place.status <> 'published' then
    raise exception 'PLACE_UNAVAILABLE' using errcode = '22023';
  end if;

  if p_guests < v_place.capacity_min or p_guests > v_place.capacity_max then
    raise exception 'GUESTS_OUT_OF_RANGE' using errcode = '22023';
  end if;

  -- ── النافذة المتعاقد عليها ──
  -- أوقات المكان مخزَّنة بلا منطقة زمنية وتُفهم بتوقيت الرياض.
  if p_rate_unit = 'hour' then
    v_start := (p_date + coalesce(p_start_time, v_place.check_in_time))
                 at time zone 'Asia/Riyadh';
    v_end   := v_start + make_interval(hours => p_duration);
    v_hours := p_duration;
  elsif p_rate_unit = 'day' then
    v_start := (p_date + v_place.check_in_time) at time zone 'Asia/Riyadh';
    v_end   := v_start + make_interval(days => p_duration);
    v_days  := p_duration;
  else -- night: من وقت الدخول اليوم إلى وقت الخروج بعد n ليلة
    v_start  := (p_date + v_place.check_in_time) at time zone 'Asia/Riyadh';
    v_end    := ((p_date + p_duration) + v_place.check_out_time)
                  at time zone 'Asia/Riyadh';
    v_nights := p_duration;
  end if;

  if v_end <= v_start then
    raise exception 'INVALID_WINDOW' using errcode = '22023';
  end if;
  if v_start < now() then
    raise exception 'PAST_DATE' using errcode = '22023';
  end if;

  -- ── السعر الأساسي ──
  v_rate := case p_rate_unit
              when 'hour'  then v_place.price_per_hour
              when 'day'   then v_place.price_per_day
              else              v_place.price_per_night
            end;
  if v_rate is null then
    raise exception 'RATE_UNIT_UNAVAILABLE' using errcode = '22023';
  end if;

  v_base := round(v_rate * pricing_multiplier(
    case p_rate_unit when 'hour' then 'per_hour'::pricing_mode
                     when 'day'  then 'per_day'::pricing_mode
                     else             'per_night'::pricing_mode end,
    v_hours, v_days, v_nights, p_guests, 1, 0));

  v_rate_pct := coalesce((select commission_rate from platform_settings limit 1), 0.10);

  v_ref := 'KSH-' || to_char(now() at time zone 'Asia/Riyadh', 'YYMMDD')
                  || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 5));

  -- المبالغ تُملأ بعد حساب الإضافات؛ نُدخل الآن ليصطدم القيد مبكرًا
  begin
    insert into bookings (
      id, reference, place_id, customer_id, host_id, source, status,
      rate_unit, units, guests, booking_start, booking_end,
      base_amount, commission_rate, quote_snapshot
    ) values (
      gen_random_uuid(), v_ref, p_place_id, v_user, v_place.host_id,
      'customer', 'pending',
      p_rate_unit, p_duration, p_guests, v_start, v_end,
      v_base, v_rate_pct,
      jsonb_build_object('rate', v_rate, 'unit', p_rate_unit,
                         'duration', p_duration, 'guests', p_guests)
    )
    returning id into v_id;
  exception when exclusion_violation then
    raise exception 'SLOT_TAKEN' using errcode = '23P01';
  end;

  -- ── الإضافات: تُسعَّر من الجدول لا من المتصفح ──
  for a in
    select * from addons
     where id = any(p_addon_ids) and place_id = p_place_id and is_active
  loop
    v_line := round(a.price * pricing_multiplier(
      a.pricing_mode, v_hours, v_days, v_nights, p_guests, 1, 0));
    v_addons := v_addons + v_line;

    insert into booking_addons (booking_id, addon_id, name_ar, unit_price,
                                pricing_mode, quantity, line_total)
    values (v_id, a.id, a.name_ar, a.price, a.pricing_mode, 1, v_line);
  end loop;

  v_subtotal   := v_base + v_addons;
  v_total      := greatest(0, v_subtotal);
  v_commission := round(v_total * v_rate_pct);

  update bookings
     set addons_amount     = v_addons,
         total_amount      = v_total,
         commission_amount = v_commission
   where id = v_id;

  return jsonb_build_object(
    'id', v_id, 'reference', v_ref,
    'booking_start', v_start, 'booking_end', v_end,
    'base_amount', v_base, 'addons_amount', v_addons,
    'total_amount', v_total, 'commission_amount', v_commission
  );
end;
$$;

-- العملاء المسجّلون فقط — الزائر لا يحجز، ولا حاجة لهذه الدالة في أي
-- سياسة RLS فسحب الصلاحية من anon آمن هنا (بخلاف is_admin/auth_role).
revoke execute on function create_booking(uuid, rate_unit, date, int, int, time, uuid[]) from public, anon;
grant  execute on function create_booking(uuid, rate_unit, date, int, int, time, uuid[]) to authenticated;
