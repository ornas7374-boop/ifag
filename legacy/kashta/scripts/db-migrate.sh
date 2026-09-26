#!/usr/bin/env bash
# تطبيق كل ملفات المخطط بالترتيب على قاعدة بيانات Supabase.
#
# الاستخدام:
#   export DATABASE_URL="postgresql://postgres:PASSWORD@db.xxxx.supabase.co:5432/postgres"
#   ./scripts/db-migrate.sh          # المخطط فقط
#   ./scripts/db-migrate.sh --seed   # المخطط + البيانات التجريبية
#
# رابط الاتصال من: Supabase Dashboard → Project Settings → Database → Connection string → URI
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "خطأ: متغيّر DATABASE_URL غير معرّف." >&2
  echo "مثال: export DATABASE_URL=\"postgresql://postgres:PASS@db.xxx.supabase.co:5432/postgres\"" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "تطبيق المخطط…"
for f in "$ROOT"/supabase/migrations/*.sql; do
  printf '  %-34s' "$(basename "$f")"
  # ON_ERROR_STOP ضروري: بدونه يواصل psql بعد الخطأ فتصير القاعدة نصف مطبَّقة
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -f "$f"
  echo "OK"
done

if [[ "${1:-}" == "--seed" ]]; then
  echo "إدخال البيانات التجريبية…"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -f "$ROOT/supabase/seed/seed.sql"
  echo "  seed.sql OK"
fi

echo "تم. لتشغيل اختبار منع الحجز المزدوج:"
echo "  psql \"\$DATABASE_URL\" -f supabase/tests/booking_overlap.sql"
