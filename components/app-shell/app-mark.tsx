import { Sprout } from "lucide-react";

import { cn } from "@/lib/utils";

export function AppMark({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-700 text-white shadow-sm"
      >
        <Sprout className="size-5" strokeWidth={2.5} />
      </span>
      <span className="min-w-0">
        <span className="block text-base font-bold tracking-tight text-stone-950">
          GoatTrack
        </span>
        <span className="block text-xs font-medium text-stone-500">
          Farm management
        </span>
      </span>
    </div>
  );
}
