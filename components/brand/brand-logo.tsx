import Image from "next/image";
import Link from "next/link";

import { getBrand } from "@/config/brand";
import { cn } from "@/lib/utils";

/**
 * الشعار والاسم يُقرآن من getBrand() دائمًا.
 * لا تكتب اسم المنصة نصًا في أي مكوّن — سيصبح تغييره لاحقًا بحثًا واستبدالًا.
 */
export async function BrandLogo({
  className,
  showName = true,
}: {
  className?: string;
  showName?: boolean;
}) {
  const brand = await getBrand();

  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5 text-primary", className)}
    >
      <Image
        src={brand.logoUrl}
        alt={brand.appName}
        width={36}
        height={36}
        className="h-9 w-9"
        priority
      />
      {showName ? (
        <span className="text-lg font-bold text-foreground">{brand.appName}</span>
      ) : null}
    </Link>
  );
}

export async function BrandName() {
  const brand = await getBrand();
  return <>{brand.appName}</>;
}
