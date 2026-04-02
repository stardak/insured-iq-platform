"use client";

import { useState } from "react";
import { X, FlaskConical } from "lucide-react";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-b bg-amber-50 px-6 py-2.5">
      <div className="flex items-center gap-2">
        <FlaskConical className="size-4 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800">
          <span className="font-medium">Demo mode</span> — You&apos;re viewing
          sample data. Connect{" "}
          <span className="font-semibold">IM Insured</span> to go live.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="flex size-6 shrink-0 items-center justify-center rounded-md text-amber-600 transition-colors hover:bg-amber-100 hover:text-amber-800"
        aria-label="Dismiss demo banner"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
