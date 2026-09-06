-- ============================================================
-- 0003 — المدن والأحياء والتصنيفات والمرافق
-- ============================================================

create table cities (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name_ar    text not null,
  name_en    text,
  created_at timestamptz not null default now()
);

create table districts (
  id       uuid primary key default gen_random_uuid(),
  city_id  uuid not null references cities(id) on delete cascade,
  name_ar  text not null,
  unique (city_id, name_ar)
);
create index districts_city_idx on districts(city_id);

create table categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name_ar    text not null,
  icon       text,
  sort_order int  not null default 0
);

create table amenities (
  id      uuid primary key default gen_random_uuid(),
  slug    text not null unique,
  name_ar text not null,
  icon    text
);
