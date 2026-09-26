-- ============================================================
-- 0004 — الملفات الشخصية
--
-- مرتبط بـ auth.users في Supabase. الدور يُخزَّن هنا وتقرأه سياسات RLS.
-- ============================================================

create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       user_role not null default 'customer',
  full_name  text not null,
  phone      text,
  avatar_url text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on profiles(role);

-- دالة مساعدة تستخدمها كل سياسات RLS لتفادي تكرار الاستعلام الفرعي.
-- security definer لأنها تقرأ profiles التي هي نفسها محمية بـ RLS.
create or replace function auth_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from profiles where id = auth.uid()) = 'admin', false);
$$;
