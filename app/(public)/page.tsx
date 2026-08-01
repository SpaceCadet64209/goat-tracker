import Link from "next/link";
import { Check, Sprout } from "lucide-react";

import { ExploreWithBestManAsk } from "@/components/best-man-ask";

const highlights = [
  "A complete picture of every goat",
  "Weights and health, without paperwork",
  "Built around the rhythm of your farm",
];

export default function HomePage() {
  return (
    <main className="min-h-dvh overflow-hidden bg-[#f7f8f4] text-stone-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 sm:py-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="GoatTrack home">
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-700 text-white shadow-sm"><Sprout className="size-5" /></span>
          <span><span className="block text-lg font-bold tracking-tight">GoatTrack</span><span className="block text-xs font-medium text-stone-500">Farm management</span></span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/demo" className="px-2 py-2 text-sm font-bold text-stone-600 hover:text-stone-950 sm:px-3">View demo</Link>
          <Link href="/sign-in" className="rounded-lg bg-stone-900 px-3.5 py-2.5 text-sm font-bold text-white hover:bg-stone-800 sm:px-4">Sign in</Link>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-16 lg:pt-24">
        <div className="absolute -top-20 right-[-12rem] -z-0 size-[28rem] rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold tracking-wide text-emerald-800 uppercase"><span className="size-1.5 rounded-full bg-emerald-600" />Made for serious goat farmers</p>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-[-0.045em] text-stone-950 sm:text-6xl lg:text-7xl">Know your herd.<br /><span className="text-emerald-700">Grow with confidence.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-stone-600">GoatTrack turns daily farm records into a clear, useful picture of your herd — from first kid to breeding season.</p>
          <div className="mt-8 flex flex-wrap gap-3"><ExploreWithBestManAsk /><Link href="/sign-up" className="inline-flex min-h-12 items-center rounded-xl border border-stone-300 bg-white px-5 text-sm font-bold text-stone-800 hover:bg-stone-50">Create an account</Link></div>
          <ul className="mt-9 grid gap-3 text-sm font-semibold text-stone-600 sm:grid-cols-3">{highlights.map((highlight) => <li key={highlight} className="flex items-start gap-2"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800"><Check className="size-3" /></span>{highlight}</li>)}</ul>
        </div>
        <div className="relative z-10 rounded-[2rem] border border-stone-200 bg-white p-3 shadow-2xl shadow-stone-300/40 sm:p-5">
          <div className="rounded-[1.45rem] bg-stone-900 p-5 text-white sm:p-7"><div className="flex items-center justify-between"><div><p className="text-xs font-bold tracking-widest text-emerald-300 uppercase">Kallanko Stud</p><h2 className="mt-2 text-2xl font-bold">Your farm, at a glance.</h2></div><span className="rounded-xl bg-white/10 p-3"><Sprout className="size-6 text-emerald-300" /></span></div><div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3"><PreviewStat value="86" label="Goats" /><PreviewStat value="12" label="Kids" /><PreviewStat value="38.6" label="Avg kg" /></div><div className="mt-5 rounded-xl bg-white/10 p-4"><p className="text-sm font-bold">This week</p><div className="mt-4 flex h-16 items-end gap-2">{[35, 48, 42, 65, 57, 75, 88].map((value, index) => <span key={value} className={index === 6 ? "flex-1 rounded-t bg-emerald-400" : "flex-1 rounded-t bg-white/25"} style={{ height: `${value}%` }} />)}</div></div></div>
          <div className="flex items-center justify-between px-3 pb-1 pt-4 text-sm"><span className="font-bold">Clear records. Better decisions.</span><Link href="/demo" className="font-bold text-emerald-700">Open demo</Link></div>
        </div>
      </section>
    </main>
  );
}

function PreviewStat({ value, label }: Readonly<{ value: string; label: string }>) {
  return <div className="rounded-xl bg-white/10 p-3"><p className="text-xl font-bold">{value}</p><p className="mt-1 text-[11px] font-semibold text-stone-300">{label}</p></div>;
}
