"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";

import { signUp, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ar } from "@/content/ar";

export default function Page() {
  const [state, action, pending] = useActionState<AuthActionState, FormData>(
    signUp,
    null,
  );

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-foreground">{ar.auth.register}</h1>

      <form action={action} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">{ar.auth.fullName}</Label>
          <Input id="fullName" name="fullName" type="text" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">{ar.auth.email}</Label>
          <Input id="email" name="email" type="email" dir="ltr" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">{ar.auth.phone}</Label>
          <Input id="phone" name="phone" type="tel" dir="ltr" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{ar.auth.password}</Label>
          <Input id="password" name="password" type="password" required minLength={8} />
        </div>

        <div className="space-y-1.5">
          <Label>{ar.auth.accountType}</Label>
          <RadioGroup name="accountType" defaultValue="customer" className="gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <RadioGroupItem value="customer" />
              {ar.auth.customer}
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <RadioGroupItem value="host" />
              {ar.auth.host}
            </label>
          </RadioGroup>
        </div>

        {state?.error ? (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? ar.common.loading : ar.auth.register}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {ar.auth.haveAccount}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {ar.auth.login}
        </Link>
      </p>
    </div>
  );
}
