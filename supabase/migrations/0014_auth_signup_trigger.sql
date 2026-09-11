-- ============================================================
-- 0014 — إنشاء صف profiles تلقائيًا عند تسجيل مستخدم جديد
--
-- لا توجد سياسة INSERT للعميل على profiles عن قصد (0012) — نفس فلسفة
-- منع العميل من تحديد قيم حساسة مباشرة. المُشغّل يعمل بصلاحية
-- security definer فيتجاوز RLS، وهو النمط المعياري في Supabase،
-- ويبقى صحيحًا مهما تغيّرت طريقة التسجيل لاحقًا (OAuth، رابط سحري).
--
-- الدور يُقرأ من user_metadata الذي يُمرَّر وقت signUp. لا مسار
-- لاختيار 'admin' من هنا — يُمنح يدويًا عبر SQL فقط.
-- ============================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role user_role;
begin
  begin
    requested_role := (new.raw_user_meta_data->>'role')::user_role;
  exception when others then
    requested_role := 'customer';
  end;
  if requested_role is null or requested_role = 'admin' then
    requested_role := 'customer';
  end if;

  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), 'مستخدم جديد'),
    nullif(new.raw_user_meta_data->>'phone', ''),
    requested_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
