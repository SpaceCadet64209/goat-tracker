"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  CircleUserRound,
  ClipboardPlus,
  LayoutDashboard,
  Menu,
  Scale,
  Settings,
  Syringe,
  UsersRound,
  Warehouse,
} from "lucide-react";

import { AppMark } from "@/components/app-shell/app-mark";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { cn } from "@/lib/utils";

type ApplicationShellProps = Readonly<{
  children: React.ReactNode;
  farmId?: string;
  farmName?: string;
}>;

const primaryItems = [
  { label: "Dashboard", segment: "", icon: LayoutDashboard },
  { label: "Goats", segment: "goats", icon: UsersRound },
  { label: "Weigh", segment: "weigh", icon: Scale },
  { label: "Vaccinations", segment: "vaccinations", icon: Syringe },
  { label: "Programs", segment: "programs", icon: ClipboardPlus },
];

export function ApplicationShell({ children, farmId, farmName }: ApplicationShellProps) {
  const pathname = usePathname();
  const farmHref = farmId ? `/farms/${farmId}` : "/farms";
  const farmLabel = farmId ? "Current farm" : "Choose a farm";

  const isActive = (segment: string) => {
    const href = segment ? `${farmHref}/${segment}` : farmHref;
    return segment ? pathname.startsWith(`${href}/`) || pathname === href : pathname === href;
  };

  return (
    <div className="min-h-dvh bg-[var(--background)] pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:pb-0">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-emerald-700 px-4 py-3 font-semibold text-white focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
      >
        Skip to content
      </a>

      <aside className="hidden border-r border-stone-200 bg-white lg:flex lg:min-h-dvh lg:flex-col lg:p-5">
        <Link
          href={farmHref}
          aria-label="GoatTrack home"
          className="rounded-xl"
        >
          <AppMark />
        </Link>
        <nav aria-label="Primary navigation" className="mt-10 space-y-1">
          {primaryItems.map(({ label, segment, icon: Icon }) => {
            const active = isActive(segment);
            return (
              <Link
                key={label}
                href={segment ? `${farmHref}/${segment}` : farmHref}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors",
                  active
                    ? "bg-emerald-50 text-emerald-800 shadow-sm ring-1 ring-emerald-100"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-950",
                )}
              >
                <Icon aria-hidden="true" className={cn("size-5", active && "text-emerald-700")} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-2 border-t border-stone-200 pt-5">
          <Link
            href="/account"
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-950"
          >
            <CircleUserRound aria-hidden="true" className="size-5" />
            Account
          </Link>
          <Link
            href="/settings"
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-950"
          >
            <Settings aria-hidden="true" className="size-5" />
            Settings
          </Link>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Link
              href={farmHref}
              aria-label="GoatTrack home"
              className="rounded-xl lg:hidden"
            >
              <AppMark />
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/farms"
                className="flex min-h-11 max-w-[12rem] items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-sm font-semibold text-stone-800 hover:bg-stone-50 sm:max-w-none"
                aria-label={`${farmLabel}; change farm`}
              >
                <Warehouse
                  aria-hidden="true"
                  className="size-4 shrink-0 text-emerald-700"
                />
                <span className="truncate">{farmName ?? farmLabel}</span>
                <ChevronDown
                  aria-hidden="true"
                  className="size-4 shrink-0 text-stone-500"
                />
              </Link>
              <details className="relative lg:hidden">
                <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 [&::-webkit-details-marker]:hidden">
                  <Menu aria-hidden="true" className="size-5" />
                  <span className="sr-only">Open account menu</span>
                </summary>
                <div className="absolute top-[calc(100%+0.5rem)] right-0 w-52 rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
                  <Link
                    href="/account"
                    className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold hover:bg-stone-100"
                  >
                    <CircleUserRound aria-hidden="true" className="size-4" />
                    Account
                  </Link>
                  <SignOutButton />
                  <Link
                    href="/settings"
                    className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold hover:bg-stone-100"
                  >
                    <Settings aria-hidden="true" className="size-4" />
                    Settings
                  </Link>
                </div>
              </details>
            </div>
          </div>
          <div
            aria-label="Current farm"
            className="border-t border-stone-100 bg-stone-50 px-4 py-2 text-sm text-stone-600 sm:px-6 lg:px-8"
          >
            <span className="font-semibold text-stone-800">Farm context:</span>{" "}
            {farmId ? farmName ?? "A farm is selected for this page." : "Select a farm to continue."}
          </div>
        </header>
        <main
          id="main-content"
          className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
        >
          {children}
        </main>
      </div>

      <nav
        aria-label="Primary navigation"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {primaryItems.map(({ label, segment, icon: Icon }) => {
          const active = isActive(segment);
          return (
            <Link
              key={label}
              href={segment ? `${farmHref}/${segment}` : farmHref}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-[4.75rem] min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 text-center text-[11px] font-semibold transition-colors sm:px-2 sm:text-xs",
                active ? "bg-emerald-50 text-emerald-800" : "text-stone-500 hover:bg-stone-50 hover:text-emerald-800",
              )}
            >
              {active ? <span aria-hidden="true" className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-emerald-700" /> : null}
              <Icon aria-hidden="true" className="size-5" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
