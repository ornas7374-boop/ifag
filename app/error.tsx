"use client";

import { Button } from "@/components/ui/button";
import { ar } from "@/content/ar";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          {ar.states.errorTitle}
        </h1>
        <p className="text-muted-foreground">{ar.states.errorHint}</p>
        <Button onClick={reset}>{ar.states.retry}</Button>
      </div>
    </div>
  );
}
