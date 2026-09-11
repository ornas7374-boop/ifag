-- ============================================================
-- 0015 — مضاعِف التسعير في SQL
--
-- مرآة حرفية لـ multiplierFor في lib/pricing/index.ts. وجودهما في
-- مكانين ضرورة لا تكرار: الواجهة تحتاجه لتعرض سعرًا لحظيًا بلا رحلة
-- شبكة، والخادم يحتاجه لأنه لا يثق بأي مبلغ قادم من المتصفح.
-- أي تعديل في أحدهما يجب أن يُنقل للآخر.
-- ============================================================

create or replace function pricing_multiplier(
  p_mode     pricing_mode,
  p_hours    numeric default 0,
  p_days     numeric default 0,
  p_nights   numeric default 0,
  p_persons  numeric default 1,
  p_quantity numeric default 1,
  p_distance numeric default 0
)
returns numeric
language sql
immutable
set search_path = public
as $$
  select case p_mode
    when 'fixed'       then 1
    when 'per_booking' then greatest(1, p_quantity)
    when 'per_hour'    then greatest(1, p_hours)    * greatest(1, p_quantity)
    when 'per_day'     then greatest(1, p_days)     * greatest(1, p_quantity)
    when 'per_night'   then greatest(1, p_nights)   * greatest(1, p_quantity)
    when 'per_person'  then greatest(1, p_persons)  * greatest(1, p_quantity)
    when 'per_unit'    then greatest(1, p_quantity)
    when 'per_km'      then greatest(0, p_distance) * greatest(1, p_quantity)
  end;
$$;
