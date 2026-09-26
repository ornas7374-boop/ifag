"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { signIn, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ar } from "@/content/ar";

/**
 * useSearchParams يتطلب حد Suspense صريحًا، وإلا فشل التصيير المسبق
 * الثابت لهذه الصفحة بالكامل عند البناء.
 */
function LoginForm() {
  const [state, action, pending] = useActionState<AuthActionState, FormData>(
    signIn,
    null,
  );
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/account";
  const justRegistered = searchParams.get("confirm") === "1";

  return (
    <>
      {justRegistered ? (
        <p className="rounded-md bg-secondary p-3 text-sm">
          أنشئ حسابك بنجاح. تحقق من بريدك الإلكتروني لتفعيله قبل الدخول.
        </p>
      ) : null}

      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={next} />

        <div className="space-y-1.5">
          <Label htmlFor="email">{ar.auth.email}</Label>
          <Input id="email" name="email" type="email" dir="ltr" required />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{ar.auth.password}</Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              {ar.auth.forgotPassword}
            </Link>
          </div>
          <Input id="password" name="password" type="password" required />
        </div>

        {state?.error ? (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? ar.common.loading : ar.auth.login}
        </Button>
      </form>
    </>
  );
}

export default function Page() {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-foreground">{ar.auth.login}</h1>

      <React.Suspense fallback={<div className="h-56" aria-hidden />}>
        <LoginForm />
      </React.Suspense>

      <p className="text-center text-sm text-muted-foreground">
        {ar.auth.noAccount}{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          {ar.auth.register}
        </Link>
      </p>
    </div>
  );
}
