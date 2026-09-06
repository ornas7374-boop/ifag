#!/usr/bin/env bash
# إعادة توليد types/database.ts من قاعدة البيانات الحقيقية.
# شغّله بعد أي migration جديدة، وإلا صارت الأنواع تكذب على المترجم.
set -euo pipefail

if [[ -z "${NEXT_PUBLIC_SUPABASE_PROJECT_REF:-}" ]]; then
  echo "خطأ: NEXT_PUBLIC_SUPABASE_PROJECT_REF غير معرّف (معرّف المشروع في رابط Supabase)." >&2
  exit 1
fi

npx --yes supabase@latest gen types typescript \
  --project-id "$NEXT_PUBLIC_SUPABASE_PROJECT_REF" \
  --schema public > types/database.ts

echo "تم تحديث types/database.ts"
