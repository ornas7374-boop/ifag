import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ar } from "@/content/ar";

export const metadata = { title: ar.auth.login };

export default function Page() {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-foreground">{ar.auth.login}</h1>

      <form className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            {ar.auth.email}
          </label>
          <Input id="email" name="email" type="email" dir="ltr" />
        </div>\n        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            {ar.auth.password}
          </label>
          <Input id="password" name="password" type="password"  />
        </div>

        <Button type="submit" size="lg" className="w-full">
          {ar.auth.login}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {ar.auth.noAccount}{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          {ar.auth.register}
        </Link>
      </p>

      <p className="text-center text-xs text-muted-foreground">
        {ar.states.phasePlaceholder}
      </p>
    </div>
  );
}
