"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  LayoutDashboard,
  Menu,
  Plus,
  Scale,
  Sprout,
  Syringe,
  UsersRound,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Herd", icon: UsersRound },
  { label: "Weigh-ins", icon: Scale },
  { label: "Health", icon: Syringe },
];

const tasks = [
  {
    title: "Vaccinate does due this week",
    detail: "8 goats · CDT booster",
    tone: "amber",
  },
  {
    title: "Record July weigh-ins",
    detail: "14 goats still outstanding",
    tone: "emerald",
  },
  {
    title: "Review breeding group B",
    detail: "Next check in 3 days",
    tone: "sky",
  },
] as const;

export default function DemoPage() {
  const [active, setActive] = useState("Overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("All caught up for today");

  return (
    <div className="min-h-dvh bg-[#f7f8f4] text-stone-900">
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label="GoatTrack home"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-700 text-white shadow-sm">
              <Sprout className="size-5" />
            </span>
            <span className="text-lg font-bold tracking-tight">GoatTrack</span>
            <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold tracking-wide text-emerald-700 uppercase sm:inline">
              Live demo
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="hidden px-3 py-2 text-sm font-semibold text-stone-600 hover:text-stone-950 sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="hidden rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 sm:block"
            >
              Start free
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="grid size-10 place-items-center rounded-lg border border-stone-200 sm:hidden"
              aria-label="Toggle demo navigation"
            >
              {menuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[90rem] lg:grid-cols-[15.5rem_minmax(0,1fr)]">
        <aside
          className={cn(
            "border-r border-stone-200 bg-white px-3 py-5 lg:min-h-[calc(100dvh-4rem)]",
            menuOpen ? "block" : "hidden lg:block",
          )}
        >
          <button
            type="button"
            className="mb-6 flex w-full items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-left text-sm"
            onClick={() =>
              setNotice("Farm switcher is available in the full app")
            }
          >
            <span>
              <span className="block font-bold">Kallanko Stud</span>
              <span className="text-xs text-stone-500">Demo farm</span>
            </span>
            <ChevronDown className="size-4 text-stone-500" />
          </button>
          <nav aria-label="Demo sections" className="space-y-1">
            {navigation.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setActive(label);
                  setMenuOpen(false);
                  setNotice(`${label} view selected`);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-colors",
                  active === label
                    ? "bg-emerald-50 text-emerald-800"
                    : "text-stone-600 hover:bg-stone-100",
                )}
              >
                <Icon className="size-[18px]" />
                {label}
              </button>
            ))}
          </nav>
          <div className="mt-8 rounded-xl bg-stone-900 p-4 text-white">
            <p className="text-xs font-bold tracking-wider text-emerald-300 uppercase">
              Your operation
            </p>
            <p className="mt-2 text-sm leading-5 text-stone-200">
              Keep herd records, health, and weight history in one calm place.
            </p>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                Friday, 1 August
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                Good morning, Nelis.
              </h1>
              <p className="mt-2 text-sm text-stone-500 sm:text-base">
                Here’s the pulse of your farm today.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setNotice(
                  "New record panel opened — try the full app to save it.",
                )
              }
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-700 px-3.5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 sm:px-4"
            >
              <Plus className="size-4" />{" "}
              <span className="hidden sm:inline">New record</span>
            </button>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3 sm:gap-4">
            <Metric value="86" label="Active goats" note="4 added this month" />
            <Metric
              value="12"
              label="Kids this season"
              note="92% survival rate"
            />
            <Metric
              value="38.6 kg"
              label="Average weight"
              note="+1.8 kg since June"
            />
          </div>

          <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.8fr)]">
            <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_2px_10px_rgb(28_25_23/0.03)] sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold">Herd progress</h2>
                  <p className="mt-1 text-sm text-stone-500">
                    Monthly recorded weight average
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotice("Weight trend report selected")}
                  className="text-sm font-bold text-emerald-700 hover:text-emerald-900"
                >
                  View report
                </button>
              </div>
              <div className="mt-8 flex h-40 items-end gap-3 border-b border-stone-100 px-1 sm:h-48 sm:gap-5">
                {[48, 56, 53, 67, 63, 76, 82].map((height, index) => (
                  <div
                    className="group flex h-full flex-1 items-end"
                    key={height}
                  >
                    <div
                      className={cn(
                        "w-full rounded-t-md transition-transform group-hover:-translate-y-1",
                        index === 6 ? "bg-emerald-700" : "bg-emerald-100",
                      )}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between text-xs font-medium text-stone-400">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
              </div>
            </section>
            <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_2px_10px_rgb(28_25_23/0.03)] sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold">Today’s focus</h2>
                  <p className="mt-1 text-sm text-stone-500">
                    Small actions, clear herd.
                  </p>
                </div>
                <ClipboardCheck className="size-5 text-emerald-700" />
              </div>
              <div className="mt-5 space-y-2">
                {tasks.map((task) => (
                  <button
                    type="button"
                    key={task.title}
                    onClick={() => setNotice(`${task.title} marked for review`)}
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-stone-50"
                  >
                    <span
                      className={cn(
                        "size-2.5 shrink-0 rounded-full",
                        task.tone === "amber"
                          ? "bg-amber-400"
                          : task.tone === "sky"
                            ? "bg-sky-400"
                            : "bg-emerald-500",
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold">
                        {task.title}
                      </span>
                      <span className="block text-xs text-stone-500">
                        {task.detail}
                      </span>
                    </span>
                    <ChevronRight className="size-4 text-stone-400" />
                  </button>
                ))}
              </div>
            </section>
          </div>
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm font-medium text-emerald-900">
            <Bell className="size-4 shrink-0 text-emerald-700" />
            {notice}
          </div>
        </main>
      </div>
    </div>
  );
}

function Metric({
  value,
  label,
  note,
}: Readonly<{ value: string; label: string; note: string }>) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_2px_10px_rgb(28_25_23/0.03)] sm:p-5">
      <p className="text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
      <p className="mt-1 text-sm font-semibold text-stone-700">{label}</p>
      <p className="mt-2 text-xs font-medium text-emerald-700">{note}</p>
    </article>
  );
}
