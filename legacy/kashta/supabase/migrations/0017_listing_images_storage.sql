-- ============================================================
-- 0017 — حاوية صور الإعلانات وسياساتها
--
-- المسار داخل الحاوية بالاصطلاح: places/<place_id>/<file> أو
-- services/<service_id>/<file>. القسم الأول يحدد الجدول المرجعي،
-- والثاني معرّف الإعلان — تفحصه سياسات الكتابة أدناه لتتحقق من
-- الملكية دون الاعتماد على أي شيء يرسله المتصفح غير المسار نفسه.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listings', 'listings', true, 5242880,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- قراءة عامة — صور الإعلانات تُعرض لكل زائر، لا حاجة لمصادقة.
create policy "listing images are public"
  on storage.objects for select
  using (bucket_id = 'listings');

-- رفع: صاحب المكان/الخدمة فقط، ويُستدل عليه من المسار لا من مُدخَل
-- يرسله المتصفح.
create policy "host uploads own place images"
  on storage.objects for insert
  with check (
    bucket_id = 'listings'
    and (storage.foldername(name))[1] = 'places'
    and exists (
      select 1 from places p
       where p.id = ((storage.foldername(name))[2])::uuid
         and (p.host_id = auth.uid() or is_admin())
    )
  );

create policy "host uploads own service images"
  on storage.objects for insert
  with check (
    bucket_id = 'listings'
    and (storage.foldername(name))[1] = 'services'
    and exists (
      select 1 from services s
       where s.id = ((storage.foldername(name))[2])::uuid
         and (s.host_id = auth.uid() or is_admin())
    )
  );

-- حذف: نفس فحص الملكية.
create policy "host deletes own place images"
  on storage.objects for delete
  using (
    bucket_id = 'listings'
    and (storage.foldername(name))[1] = 'places'
    and exists (
      select 1 from places p
       where p.id = ((storage.foldername(name))[2])::uuid
         and (p.host_id = auth.uid() or is_admin())
    )
  );

create policy "host deletes own service images"
  on storage.objects for delete
  using (
    bucket_id = 'listings'
    and (storage.foldername(name))[1] = 'services'
    and exists (
      select 1 from services s
       where s.id = ((storage.foldername(name))[2])::uuid
         and (s.host_id = auth.uid() or is_admin())
    )
  );
