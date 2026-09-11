-- ============================================================
-- بيانات تجريبية (المتطلب 27)
--
-- لا تحتوي على بيانات شخصية حقيقية — كل الأسماء والأرقام مُختلقة.
-- تُشغَّل بعد تطبيق كل ملفات migrations.
--
-- ملاحظة: صفوف profiles تتطلب وجود مستخدمين في auth.users أولًا.
-- أنشئهم من لوحة Supabase أو عبر Admin API ثم بدّل المعرّفات أدناه.
-- ============================================================

insert into cities (id, slug, name_ar) values
  ('aaaaaaa1-0000-4000-8000-000000000001', 'riyadh',    'الرياض'),
  ('aaaaaaa1-0000-4000-8000-000000000002', 'jeddah',    'جدة'),
  ('aaaaaaa1-0000-4000-8000-000000000003', 'dammam',    'الدمام'),
  ('aaaaaaa1-0000-4000-8000-000000000004', 'abha',      'أبها'),
  ('aaaaaaa1-0000-4000-8000-000000000005', 'taif',      'الطائف'),
  ('aaaaaaa1-0000-4000-8000-000000000006', 'tabuk',     'تبوك'),
  ('aaaaaaa1-0000-4000-8000-000000000007', 'buraidah',  'بريدة'),
  ('aaaaaaa1-0000-4000-8000-000000000008', 'hail',      'حائل')
on conflict (slug) do nothing;

insert into categories (slug, name_ar, icon, sort_order) values
  ('kashta',       'كشتات',         'flame',     1),
  ('camp',         'مخيمات',        'tent',      2),
  ('wild',         'أماكن برية',    'mountain',  3),
  ('tents',        'خيام',          'tent-tree', 4),
  ('majlis',       'جلسات',         'armchair',  5),
  ('tables',       'طاولات وكراسي', 'table',     6),
  ('hospitality',  'ضيافة',         'coffee',    7),
  ('setup',        'خدمات تجهيز',   'wrench',    8),
  ('equipment',    'معدات',         'package',   9)
on conflict (slug) do nothing;

insert into amenities (slug, name_ar, icon) values
  ('fire-pit',  'مشب',           'flame'),
  ('tent',      'خيمة',          'tent'),
  ('majlis',    'جلسة',          'armchair'),
  ('restroom',  'دورة مياه',     'bath'),
  ('kitchen',   'مطبخ',          'utensils'),
  ('power',     'كهرباء',        'zap'),
  ('water',     'ماء',           'droplet'),
  ('parking',   'موقف سيارات',   'car'),
  ('wifi',      'إنترنت',        'wifi'),
  ('pool',      'مسبح',          'waves'),
  ('ac',        'مكيف',          'wind'),
  ('projector', 'بروجكتر',       'projector')
on conflict (slug) do nothing;

-- نسبة العمولة الافتراضية
update platform_settings set commission_rate = 0.10 where id;
