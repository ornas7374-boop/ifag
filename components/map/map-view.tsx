import { MapPin } from "lucide-react";

import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";
import type { GeoPoint } from "@/types/domain";

/**
 * واجهة الخريطة المجرّدة.
 *
 * قرار الخرائط: Google Maps (أفضل تغطية للعناوين السعودية).
 * لكن المفتاح يحتاج حساب فوترة، ولا يجب أن تتعطّل الصفحة بدونه —
 * لذلك نعرض بديلًا واضحًا بدل شاشة بيضاء أو خطأ.
 *
 * المرحلة 4: يُستبدل جسم هذا المكوّن بـ @vis.gl/react-google-maps
 * دون تغيير أي مستدعٍ، لأن الواجهة (props) هي العقد.
 */
export function MapView({
  center,
  label,
  className,
}: {
  center: GeoPoint;
  label?: string;
  className?: string;
}) {
  const hasKey = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

  return (
    <div
      className={cn(
        "relative grid min-h-64 place-items-center overflow-hidden rounded-lg border border-border bg-muted",
        className,
      )}
      role="img"
      aria-label={label ?? "خريطة الموقع"}
    >
      <div className="space-y-2 px-6 text-center">
        <MapPin className="mx-auto size-8 text-primary" aria-hidden />
        {label ? (
          <p className="text-sm font-medium text-foreground">{label}</p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
        </p>
        {!hasKey ? (
          <p className="text-xs text-muted-foreground">
            الخريطة التفاعلية {ar.common.soon} — تحتاج مفتاح Google Maps
          </p>
        ) : null}
      </div>
    </div>
  );
}
