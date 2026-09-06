"use client";

import * as React from "react";
import Link from "next/link";
import { Check, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LocationPicker, type PickedLocation } from "@/components/map/location-picker";
import { PriceBreakdown } from "@/components/domain/price-breakdown";
import { EmptyState } from "@/components/states/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/lib/cart/cart-context";
import { ar } from "@/content/ar";
import { formatSAR } from "@/lib/format";
import { cn } from "@/lib/utils";

const STEPS = ["الموقع والتواصل", "المراجعة والدفع"] as const;

export function CheckoutFlow() {
  const { items, quote, isHydrated, clear } = useCart();
  const [step, setStep] = React.useState(0);
  const [location, setLocation] = React.useState<PickedLocation | null>(null);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [placed, setPlaced] = React.useState(false);

  // التوصيل مطلوب فقط إن كان في السلة خدمة تحتاجه
  const needsDelivery = items.some((i) => i.requiresDelivery);

  const locationValid =
    !needsDelivery ||
    (location !== null &&
      Number.isFinite(location.point.lat) &&
      Number.isFinite(location.point.lng) &&
      location.addressText.trim().length > 2);

  const contactValid = name.trim().length > 2 && /^0?5\d{8}$/.test(phone.replace(/\s/g, ""));
  const canProceed = locationValid && contactValid;

  if (!isHydrated) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (placed) {
    return (
      <Card>
        <CardContent className="space-y-4 p-8 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-success/15 text-success">
            <Check className="size-7" aria-hidden />
          </div>
          <h2 className="text-xl font-bold">تم استلام طلبك</h2>
          <p className="text-sm text-muted-foreground">
            سيتواصل معك المزوّد لتأكيد الموعد. الدفع الفعلي يُفعّل عند ربط بوابة
            الدفع.
          </p>
          <Button asChild>
            <Link href="/account/orders">{ar.account.orders}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={ar.order.emptyCart}
        hint={ar.order.emptyCartHint}
        action={
          <Button asChild>
            <Link href="/search?kind=service">{ar.nav.services}</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        {/* مؤشر الخطوات */}
        <ol className="flex gap-2" aria-label="خطوات إتمام الطلب">
          {STEPS.map((label, i) => (
            <li key={label} className="flex-1">
              <div
                className={cn(
                  "rounded-md border px-3 py-2 text-sm",
                  i === step
                    ? "border-primary bg-primary/5 font-medium text-foreground"
                    : "border-border text-muted-foreground",
                )}
                aria-current={i === step ? "step" : undefined}
              >
                {i + 1}. {label}
              </div>
            </li>
          ))}
        </ol>

        {step === 0 ? (
          <>
            {needsDelivery ? (
              <Card>
                <CardHeader>
                  <CardTitle>{ar.order.deliveryLocation}</CardTitle>
                </CardHeader>
                <CardContent>
                  <LocationPicker value={location} onChange={setLocation} />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-5 text-sm text-muted-foreground">
                  لا تحتاج خدمات سلتك إلى توصيل، فلا حاجة لتحديد موقع.
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>بيانات التواصل</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">{ar.auth.fullName}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">{ar.auth.phone}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    dir="ltr"
                    placeholder="05XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    aria-invalid={phone.length > 0 && !contactValid}
                  />
                  {phone.length > 0 && !/^0?5\d{8}$/.test(phone.replace(/\s/g, "")) ? (
                    <p className="text-xs text-destructive">
                      أدخل رقم جوال سعودي صحيح يبدأ بـ 05
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full"
              disabled={!canProceed}
              onClick={() => setStep(1)}
            >
              متابعة للمراجعة
            </Button>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>مراجعة الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="divide-y divide-border">
                  {items.map((item) => (
                    <li key={item.serviceId} className="flex justify-between gap-4 py-3">
                      <span>
                        {item.title_ar}
                        <span className="text-muted-foreground"> × {item.quantity}</span>
                      </span>
                      <span className="font-medium">{formatSAR(item.unitPrice)}</span>
                    </li>
                  ))}
                </ul>

                <Separator />

                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{ar.auth.fullName}</dt>
                    <dd>{name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{ar.auth.phone}</dt>
                    <dd dir="ltr">{phone}</dd>
                  </div>
                  {location ? (
                    <div className="flex justify-between gap-4">
                      <dt className="shrink-0 text-muted-foreground">
                        {ar.order.deliveryLocation}
                      </dt>
                      <dd className="text-end">{location.addressText}</dd>
                    </div>
                  ) : null}
                </dl>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ChevronLeft aria-hidden className="rtl:-scale-x-100" />
                {ar.common.back}
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={() => {
                  setPlaced(true);
                  clear();
                }}
              >
                تأكيد الطلب
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              المبلغ المعروض تقديري. عند تفعيل بوابة الدفع يُعاد حسابه في الخادم
              قبل التحصيل، ولا يُعتمد أي مبلغ قادم من المتصفح.
            </p>
          </>
        )}
      </div>

      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <Card>
          <CardHeader>
            <CardTitle>{ar.order.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <PriceBreakdown quote={quote} />
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
