import type { Metadata } from "next";

import { Logo } from "@/components/layout/logo";
import { ButtonLink } from "@/components/ui/button";
import { ar } from "@/lib/content/ar";

export const metadata: Metadata = {
  title: ar.notFound.metaTitle,
};

export default function NotFound() {
  const t = ar.notFound;

  return (
    <main className="mx-auto flex min-h-dvh max-w-reading flex-col items-center justify-center px-4 text-center">
      <Logo />
      <h1 className="mt-10 text-2xl font-bold text-text sm:text-3xl">{t.title}</h1>
      <p className="mt-3 text-text-muted">{t.body}</p>
      <ButtonLink href="/" className="mt-8">
        {t.back}
      </ButtonLink>
    </main>
  );
}
