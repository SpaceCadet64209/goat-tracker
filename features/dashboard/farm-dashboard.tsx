import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Scale,
  Syringe,
  TriangleAlert,
  UsersRound,
} from "lucide-react";

const metrics = [
  {
    label: "Active goats",
    value: "5",
    detail: "2 bucks · 3 does",
    icon: UsersRound,
  },
  {
    label: "Weigh-ins logged",
    value: "28",
    detail: "5 in the last 30 days",
    icon: Scale,
  },
  {
    label: "Vaccines in library",
    value: "4",
    detail: "Custom types",
    icon: Syringe,
  },
  {
    label: "Vaccinations due",
    value: "2",
    detail: "None overdue",
    icon: TriangleAlert,
  },
];

export function FarmDashboard({ farmName }: Readonly<{ farmName: string }>) {
  return (
    <div className="grid gap-6 sm:gap-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-emerald-700">{farmName}</p>
        <h1 className="text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
          Farm dashboard
        </h1>
        <p className="max-w-2xl text-base text-stone-600 sm:text-lg">
          Overview of your herd, weights, and vaccinations.
        </p>
      </header>

      <section
        aria-label="Farm overview"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map(({ label, value, detail, icon: Icon }) => (
          <article
            key={label}
            className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="max-w-36 text-sm font-medium text-stone-600">
                {label}
              </h2>
              <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <Icon className="size-5" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-stone-950">
              {value}
            </p>
            <p className="mt-2 text-sm text-stone-500">{detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-stone-950">
                Herd snapshot
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                A healthy, growing demo herd.
              </p>
            </div>
            <Link
              href="goats"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View register
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-2xl font-bold text-emerald-950">3</p>
              <p className="mt-1 text-xs font-semibold text-emerald-800">
                Does
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-2xl font-bold text-amber-950">2</p>
              <p className="mt-1 text-xs font-semibold text-amber-800">Bucks</p>
            </div>
            <div className="rounded-xl bg-sky-50 p-4">
              <p className="text-2xl font-bold text-sky-950">2</p>
              <p className="mt-1 text-xs font-semibold text-sky-800">Growing</p>
            </div>
          </div>
        </article>
        <article className="rounded-2xl bg-emerald-800 p-5 text-white shadow-sm sm:p-6">
          <p className="text-sm font-semibold text-emerald-100">Quick action</p>
          <h2 className="mt-2 text-xl font-bold">Log today&apos;s weights</h2>
          <p className="mt-2 text-sm leading-6 text-emerald-100">
            A regular check-in makes it easy to follow your herd&apos;s
            progress.
          </p>
          <Link
            href="weigh"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-emerald-900 hover:bg-emerald-50"
          >
            Open weigh-ins <ArrowRight className="size-4" />
          </Link>
        </article>
      </section>

      <section
        className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7"
        aria-labelledby="due-heading"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2
              id="due-heading"
              className="text-xl font-bold tracking-tight text-stone-950"
            >
              Vaccinations due soon
            </h2>
            <p className="mt-1 text-sm text-stone-500">The next 30 days</p>
          </div>
          <a
            href="#farm-tools"
            className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            All goats <ArrowUpRight className="size-4" />
          </a>
        </div>
        <div className="mt-8 rounded-xl bg-stone-50 px-5 py-10 text-center text-stone-500">
          <Syringe
            aria-hidden="true"
            className="mx-auto mb-3 size-7 text-stone-300"
          />
          Nothing due in the next 30 days.
        </div>
      </section>
    </div>
  );
}
