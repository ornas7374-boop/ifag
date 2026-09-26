-- ============================================================
-- بيانات عرض — لإظهار المنصة حيّة قبل وصول مضيفين حقيقيين
--
-- ★ مؤقتة بطبيعتها ★
-- كل صف هنا يحمل slug يبدأ بـ demo- أو معرّفًا يبدأ بـ d00000،
-- فحذفها كلها أمر واحد (انظر آخر الملف). احذفها قبل التشغيل
-- الحقيقي — وجود "كشتة الرمال الذهبية" بجانب إعلانات فعلية يربك
-- العملاء ويشوّه التقارير.
--
-- الأسماء والأرقام كلها مُختلقة ولا تخصّ أشخاصًا حقيقيين.
-- تُشغَّل بعد seed.sql (تعتمد على المدن والمرافق منه).
-- ============================================================

-- ── الحسابات ──
insert into auth.users (id, raw_user_meta_data) values
  ('d0000001-0000-4000-8000-000000000001','{"full_name":"فهد العتيبي","role":"host"}'::jsonb),
  ('d0000001-0000-4000-8000-000000000002','{"full_name":"مؤسسة ديار للتجهيز","role":"host"}'::jsonb),
  ('d0000001-0000-4000-8000-000000000003','{"full_name":"سارة الحربي","role":"customer"}'::jsonb),
  ('d0000001-0000-4000-8000-000000000004','{"full_name":"عبدالله القحطاني","role":"customer"}'::jsonb),
  ('d0000001-0000-4000-8000-000000000005','{"full_name":"نورة الشمري","role":"customer"}'::jsonb),
  ('d0000001-0000-4000-8000-000000000006','{"full_name":"ماجد الدوسري","role":"customer"}'::jsonb)
on conflict (id) do nothing;

-- ── الأماكن ──
-- الأسعار بالهللة. rating_avg/rating_count مضبوطان يدويًا هنا لأن
-- لا مُشغّل يعيد حسابهما من جدول التقييمات بعد.
insert into places (
  id, slug, host_id, title_ar, description_ar, place_kind, status, city_id,
  address_text, latitude, longitude, capacity_min, capacity_max,
  check_in_time, check_out_time, turnaround_minutes,
  price_per_hour, price_per_day, price_per_night,
  rating_avg, rating_count, cancellation_policy_ar, rules_ar, published_at
) values
 ('d0000002-0000-4000-8000-000000000001','demo-golden-sands','d0000001-0000-4000-8000-000000000001',
  'كشتة الرمال الذهبية',
  'موقع مهيّأ على أطراف الثمامة، جلسة عربية واسعة ومشب حجري ودورة مياه نظيفة. مناسب للعوائل ومجموعات الأصدقاء، والوصول معبّد حتى البوابة.',
  'kashta','published','aaaaaaa1-0000-4000-8000-000000000001',
  'طريق الثمامة، شمال الرياض',24.9312,46.8451,4,25,'16:00','12:00',60,
  null,80000,120000,4.7,34,'إلغاء مجاني حتى 48 ساعة قبل الموعد. بعدها يُخصم 50%.',
  'ممنوع إشعال النار خارج المشب. الهدوء بعد منتصف الليل.',now()),
 ('d0000002-0000-4000-8000-000000000002','demo-royal-camp','d0000001-0000-4000-8000-000000000001',
  'مخيم الصحراء الملكي',
  'مخيم متكامل بأربع خيام مكيّفة ومجلس رئيسي ومطبخ مجهّز. خدمة استقبال وتنظيف يومي، ومولّد كهرباء احتياطي.',
  'camp','published','aaaaaaa1-0000-4000-8000-000000000001',
  'طريق الدرعية القديم',24.7500,46.5100,10,60,'15:00','12:00',180,
  null,null,320000,4.9,58,'إلغاء مجاني حتى 7 أيام. بعدها يُخصم 30%.',null,now()),
 ('d0000002-0000-4000-8000-000000000003','demo-soudah-view','d0000001-0000-4000-8000-000000000001',
  'بر السودة المطل',
  'أرض مفتوحة بإطلالة مباشرة على جبال السودة. بلا خدمات مرفقة — للراغبين بتجربة برية خالصة وتصوير الشروق.',
  'wild','published','aaaaaaa1-0000-4000-8000-000000000004',
  'السودة، أعلى الجبل',18.2700,42.3650,2,15,'14:00','12:00',30,
  15000,40000,60000,4.5,21,'إلغاء مجاني حتى 24 ساعة قبل الموعد.',
  'المكان بري بلا مياه أو كهرباء — جهّز احتياجك مسبقًا.',now()),
 ('d0000002-0000-4000-8000-000000000004','demo-palm-kashta','d0000001-0000-4000-8000-000000000001',
  'كشتة النخيل',
  'وسط مزرعة نخيل في بريدة، ظل طبيعي طوال النهار وجلسة مسقوفة ومسبح صغير للأطفال.',
  'kashta','published','aaaaaaa1-0000-4000-8000-000000000007',
  'طريق المزارع، بريدة',26.3260,43.9750,5,30,'16:00','13:00',60,
  null,70000,95000,4.6,27,'إلغاء مجاني حتى 48 ساعة قبل الموعد.',null,now()),
 ('d0000002-0000-4000-8000-000000000005','demo-shafa-camp','d0000001-0000-4000-8000-000000000001',
  'مخيم الشفا',
  'مخيم جبلي في الشفا بالطائف، جوّ بارد صيفًا وخيمتان مجهّزتان ومنطقة شواء منفصلة.',
  'camp','published','aaaaaaa1-0000-4000-8000-000000000005',
  'الشفا، الطائف',21.0700,40.3100,6,35,'15:00','12:00',120,
  null,110000,180000,4.8,41,'إلغاء مجاني حتى 5 أيام.',null,now()),
 ('d0000002-0000-4000-8000-000000000006','demo-thumamah','d0000001-0000-4000-8000-000000000001',
  'بر الثمامة السريع',
  'موقع قريب من الرياض للكشتات القصيرة. يُحجز بالساعة، مناسب لتجمّع بعد الدوام أو شواء سريع.',
  'wild','published','aaaaaaa1-0000-4000-8000-000000000001',
  'مخرج 21، الثمامة',25.0100,46.7200,2,12,'16:00','23:00',30,
  15000,70000,null,4.3,12,'إلغاء مجاني حتى 12 ساعة قبل الموعد.',null,now()),
 ('d0000002-0000-4000-8000-000000000007','demo-abhur-beach','d0000001-0000-4000-8000-000000000001',
  'كشتة شاطئ أبحر',
  'جلسة على رمال أبحر الشمالية مع إطلالة بحرية مباشرة، مظلّة وطاولات وإنارة ليلية.',
  'kashta','published','aaaaaaa1-0000-4000-8000-000000000002',
  'أبحر الشمالية، جدة',21.7400,39.1000,4,20,'16:00','12:00',90,
  null,100000,150000,4.4,19,'إلغاء مجاني حتى 48 ساعة قبل الموعد.',null,now()),
 ('d0000002-0000-4000-8000-000000000008','demo-tabuk-north','d0000001-0000-4000-8000-000000000001',
  'مخيم تبوك الشمالي',
  'مخيم واسع على أطراف تبوك، مناسب للمجموعات الكبيرة والمناسبات. مساحة انتظار سيارات تتسع لعشرين مركبة.',
  'camp','published','aaaaaaa1-0000-4000-8000-000000000006',
  'شمال تبوك',28.4300,36.5800,15,80,'15:00','12:00',180,
  null,150000,220000,4.2,9,'إلغاء مجاني حتى 7 أيام.',null,now())
on conflict (id) do nothing;

-- ── الخدمات المتنقلة ──
insert into services (
  id, slug, host_id, title_ar, description_ar, service_kind, status, city_id,
  price, pricing_mode, min_quantity, max_quantity, unit_label_ar,
  requires_delivery, requires_setup, setup_duration_minutes,
  delivery_strategy, delivery_fee, free_delivery_over, max_distance_km,
  rating_avg, rating_count, published_at
) values
 ('d0000003-0000-4000-8000-000000000001','demo-full-tent','d0000001-0000-4000-8000-000000000002',
  'خيمة مجهّزة كاملة',
  'خيمة 4×6 مع سجاد ومفارش وإضاءة، تُنصب في موقعك خلال ساعة. تشمل الفك بعد انتهاء المناسبة.',
  'setup','published','aaaaaaa1-0000-4000-8000-000000000001',
  150000,'per_booking',1,3,'خيمة',true,true,60,'flat',20000,500000,80,4.8,63,now()),
 ('d0000003-0000-4000-8000-000000000002','demo-table-chairs','d0000001-0000-4000-8000-000000000002',
  'طاولة + 6 كراسي',
  'طقم طاولة خشبية مع ستة كراسي مبطّنة. السعر للطقم الواحد، ويمكن طلب أكثر من طقم.',
  'product','published','aaaaaaa1-0000-4000-8000-000000000001',
  15000,'per_unit',1,10,'طقم',true,false,null,'flat',10000,300000,60,4.5,38,now()),
 ('d0000003-0000-4000-8000-000000000003','demo-coffee-server','d0000001-0000-4000-8000-000000000002',
  'صبّاب قهوة',
  'صبّاب بالزي السعودي يقدّم القهوة والشاي طوال المناسبة. السعر بالساعة لكل صبّاب.',
  'labor','published','aaaaaaa1-0000-4000-8000-000000000001',
  20000,'per_hour',1,6,'صبّاب',true,false,null,'free',0,null,100,4.9,52,now()),
 ('d0000003-0000-4000-8000-000000000004','demo-arabic-majlis','d0000001-0000-4000-8000-000000000002',
  'جلسة عربية فاخرة',
  'جلسة أرضية بمساند ومفارش وطاولات قهوة، تتسع لعشرين شخصًا. تُركّب وتُفك في نفس اليوم.',
  'setup','published','aaaaaaa1-0000-4000-8000-000000000002',
  90000,'per_booking',1,2,'جلسة',true,true,45,'flat',25000,null,50,4.7,29,now()),
 ('d0000003-0000-4000-8000-000000000005','demo-desert-cooler','d0000001-0000-4000-8000-000000000002',
  'مكيّف صحراوي',
  'مكيّف صحراوي يعمل على الكهرباء، مناسب للخيام المغلقة. يشمل التوصيل والتشغيل.',
  'product','published','aaaaaaa1-0000-4000-8000-000000000001',
  12000,'per_day',1,8,'مكيّف',true,false,null,'flat',15000,200000,70,4.1,14,now()),
 ('d0000003-0000-4000-8000-000000000006','demo-hospitality','d0000001-0000-4000-8000-000000000002',
  'ضيافة كاملة للشخص',
  'قهوة وتمر ومكسّرات ومشروبات ساخنة، تُحسب لكل شخص. الحد الأدنى عشرة أشخاص.',
  'labor','published','aaaaaaa1-0000-4000-8000-000000000001',
  4500,'per_person',10,100,'شخص',true,false,null,'free',0,null,120,4.6,44,now())
on conflict (id) do nothing;

-- ── ربط المرافق ──
insert into place_amenities (place_id, amenity_id)
select p.id, a.id from places p, amenities a
 where p.slug='demo-golden-sands' and a.slug in ('fire-pit','majlis','restroom','parking','power','water')
union all select p.id, a.id from places p, amenities a
 where p.slug='demo-royal-camp' and a.slug in ('tent','majlis','kitchen','restroom','power','water','parking','ac','wifi')
union all select p.id, a.id from places p, amenities a
 where p.slug='demo-soudah-view' and a.slug in ('fire-pit','parking')
union all select p.id, a.id from places p, amenities a
 where p.slug='demo-palm-kashta' and a.slug in ('majlis','restroom','water','parking','pool')
union all select p.id, a.id from places p, amenities a
 where p.slug='demo-shafa-camp' and a.slug in ('tent','fire-pit','restroom','kitchen','parking')
union all select p.id, a.id from places p, amenities a
 where p.slug='demo-thumamah' and a.slug in ('fire-pit','parking')
union all select p.id, a.id from places p, amenities a
 where p.slug='demo-abhur-beach' and a.slug in ('majlis','restroom','power','parking')
union all select p.id, a.id from places p, amenities a
 where p.slug='demo-tabuk-north' and a.slug in ('tent','majlis','kitchen','restroom','power','parking','projector')
on conflict do nothing;

-- ── الإضافات ──
-- ::pricing_mode صريح: داخل SELECT لا يستنتج Postgres نوع الـ enum من
-- العمود الهدف كما يفعل داخل VALUES.
insert into addons (place_id, name_ar, description_ar, price, pricing_mode)
select id,'ذبيحة كاملة مع التجهيز','خروف نعيمي يُذبح ويُجهّز في الموقع.',45000,'per_booking'::pricing_mode from places where slug='demo-golden-sands'
union all select id,'ضيافة للشخص','قهوة وتمر ومكسّرات.',2500,'per_person'::pricing_mode from places where slug='demo-golden-sands'
union all select id,'مشب مجهّز بالحطب','حطب سمر جاهز مع الإشعال.',12000,'per_booking'::pricing_mode from places where slug='demo-golden-sands'
union all select id,'إفطار صباحي','فطور شعبي يُقدَّم صباح اليوم التالي.',6000,'per_person'::pricing_mode from places where slug='demo-royal-camp'
union all select id,'خدمة تنظيف إضافية','تنظيف أثناء الإقامة.',15000,'per_day'::pricing_mode from places where slug='demo-royal-camp'
union all select id,'مرشد للتصوير','مرافق يعرف أفضل مواقع الشروق.',25000,'per_booking'::pricing_mode from places where slug='demo-soudah-view';

-- ── التقييمات ──
insert into reviews (author_id, place_id, rating, body_ar, created_at)
select 'd0000001-0000-4000-8000-000000000003'::uuid, id, 5,
  'المكان نظيف ومرتب، والمشب جاهز من قبل وصولنا. صاحب المكان متعاون ورد على كل استفساراتنا بسرعة.',
  now() - interval '9 days' from places where slug='demo-golden-sands'
union all select 'd0000001-0000-4000-8000-000000000004'::uuid, id, 4,
  'ممتاز عمومًا، بس الوصول يحتاج سيارة عالية آخر كيلو. الجلسة واسعة وتكفي عشرين شخص مرتاحين.',
  now() - interval '21 days' from places where slug='demo-golden-sands'
union all select 'd0000001-0000-4000-8000-000000000005'::uuid, id, 5,
  'أفضل مخيم جربته. الخيام مكيّفة فعلًا مو بالاسم، والمجلس كبير والخدمة راقية من أول لحظة.',
  now() - interval '5 days' from places where slug='demo-royal-camp'
union all select 'd0000001-0000-4000-8000-000000000006'::uuid, id, 5,
  'حجزناه لمناسبة عائلية وكان فوق التوقع. التنظيف اليومي فرق كبير.',
  now() - interval '33 days' from places where slug='demo-royal-camp'
union all select 'd0000001-0000-4000-8000-000000000003'::uuid, id, 4,
  'الإطلالة تستاهل كل ريال. بس انتبهوا: ما فيه أي خدمات، جهّزوا مويتكم وأكلكم من تحت.',
  now() - interval '14 days' from places where slug='demo-soudah-view'
union all select 'd0000001-0000-4000-8000-000000000004'::uuid, id, 5,
  'الظل طول اليوم شي ما تلقاه بغير المزارع. الأطفال ما طلعوا من المسبح.',
  now() - interval '7 days' from places where slug='demo-palm-kashta'
union all select 'd0000001-0000-4000-8000-000000000005'::uuid, id, 5,
  'الجو في الشفا صيفًا ما له مثيل. منطقة الشواء منفصلة وهذي نقطة ممتازة.',
  now() - interval '18 days' from places where slug='demo-shafa-camp'
union all select 'd0000001-0000-4000-8000-000000000006'::uuid, id, 4,
  'مناسب جدًا لتجمّع سريع بعد الدوام. الحجز بالساعة فكرة ذكية.',
  now() - interval '3 days' from places where slug='demo-thumamah';

insert into reviews (author_id, service_id, rating, body_ar, created_at)
select 'd0000001-0000-4000-8000-000000000003'::uuid, id, 5,
  'وصلوا قبل الموعد بنص ساعة وركّبوا الخيمة بسرعة. الفك بعد المناسبة كان بنفس الاحترافية.',
  now() - interval '11 days' from services where slug='demo-full-tent'
union all select 'd0000001-0000-4000-8000-000000000004'::uuid, id, 5,
  'الصبّاب كان محترم ومنتبه، ما احتجنا نطلب منه شي طول السهرة.',
  now() - interval '6 days' from services where slug='demo-coffee-server'
union all select 'd0000001-0000-4000-8000-000000000005'::uuid, id, 4,
  'الكراسي مريحة والطاولة قوية. التوصيل تأخر ساعة عن الموعد المتفق عليه.',
  now() - interval '25 days' from services where slug='demo-table-chairs'
union all select 'd0000001-0000-4000-8000-000000000006'::uuid, id, 5,
  'الجلسة طلعت أحلى من الصور. ركّبوها في أقل من ساعة.',
  now() - interval '8 days' from services where slug='demo-arabic-majlis';

-- ============================================================
-- الحذف الكامل — شغّل هذا قبل التشغيل الحقيقي
-- ============================================================
-- delete from reviews         where author_id::text like 'd0000001%';
-- delete from booking_addons  where booking_id in (select id from bookings where place_id::text like 'd0000002%');
-- delete from bookings        where place_id::text like 'd0000002%';
-- delete from addons          where place_id::text like 'd0000002%';
-- delete from place_amenities where place_id::text like 'd0000002%';
-- delete from services        where slug like 'demo-%';
-- delete from places          where slug like 'demo-%';
-- delete from profiles        where id::text like 'd0000001%';
-- delete from auth.users      where id::text like 'd0000001%';
