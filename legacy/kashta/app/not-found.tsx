import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ar } from "@/content/ar";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          {ar.states.notFoundTitle}
        </h1>
        <p className="text-muted-foreground">{ar.states.notFoundHint}</p>
        <Button asChild>
          <Link href="/">{ar.states.backHome}</Link>
        </Button>
      </div>
    </div>
  );
}
