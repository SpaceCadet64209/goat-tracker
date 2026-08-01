"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Plus } from "lucide-react";

export function HealthNewRecord({
  farmId,
  section,
}: Readonly<{ farmId: string; section: "vaccinations" | "programs" }>) {
  const isVaccination = section === "vaccinations";
  const [saved, setSaved] = useState(false);
  const title = isVaccination
    ? "Add a vaccination"
    : "Create a vaccination programme";
  const fieldLabel = isVaccination ? "Vaccine name" : "Programme name";
  return (
    <section className="mx-auto max-w-2xl">
      <Link
        href={`/farms/${farmId}/${section}`}
        className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        ← Back to {isVaccination ? "vaccinations" : "programmes"}
      </Link>
      <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
        {saved ? (
          <div className="py-10 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="size-7" />
            </span>
            <h1 className="mt-5 text-2xl font-bold text-stone-950">
              Saved to the demo
            </h1>
            <p className="mt-2 text-stone-600">
              Your {isVaccination ? "vaccination" : "programme"} is ready to
              connect to the data layer later.
            </p>
            <Link
              href={`/farms/${farmId}/${section}`}
              className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Return to {isVaccination ? "vaccinations" : "programmes"}
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-stone-950">
              {title}
            </h1>
            <p className="mt-2 text-stone-600">
              Fill in the essentials to preview the health workflow.
            </p>
            <form
              className="mt-7 grid gap-5"
              onSubmit={(event) => {
                event.preventDefault();
                setSaved(true);
              }}
            >
              <label className="grid gap-2 text-sm font-semibold text-stone-800">
                {fieldLabel}
                <input
                  required
                  className="rounded-lg border border-stone-300 bg-white px-3 py-2 font-normal outline-none placeholder:text-stone-400 focus:border-emerald-700"
                  placeholder={
                    isVaccination
                      ? "e.g. Multivax P Plus"
                      : "e.g. Kid starter programme"
                  }
                />
              </label>
              {isVaccination ? (
                <>
                  <label className="grid gap-2 text-sm font-semibold text-stone-800">
                    Protects against
                    <input
                      className="rounded-lg border border-stone-300 bg-white px-3 py-2 font-normal outline-none placeholder:text-stone-400 focus:border-emerald-700"
                      placeholder="e.g. Clostridial diseases"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-stone-800">
                    Recommended interval
                    <select className="rounded-lg border border-stone-300 bg-white px-3 py-2 font-normal outline-none focus:border-emerald-700">
                      <option>Every 6 months</option>
                      <option>Annual booster</option>
                      <option>One-off dose</option>
                    </select>
                  </label>
                </>
              ) : (
                <>
                  <label className="grid gap-2 text-sm font-semibold text-stone-800">
                    Herd group
                    <select className="rounded-lg border border-stone-300 bg-white px-3 py-2 font-normal outline-none focus:border-emerald-700">
                      <option>Kids</option>
                      <option>Does & bucks</option>
                      <option>Quarantine pen</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-stone-800">
                    First dose due
                    <input
                      type="date"
                      className="rounded-lg border border-stone-300 bg-white px-3 py-2 font-normal outline-none focus:border-emerald-700"
                    />
                  </label>
                </>
              )}
              <label className="grid gap-2 text-sm font-semibold text-stone-800">
                Notes{" "}
                <span className="font-normal text-stone-500">(optional)</span>
                <textarea
                  className="min-h-28 rounded-lg border border-stone-300 bg-white px-3 py-2 font-normal outline-none placeholder:text-stone-400 focus:border-emerald-700"
                  placeholder="Anything useful for the team"
                />
              </label>
              <div className="flex flex-wrap gap-3 pt-1">
                <button className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">
                  <Plus className="size-4" />
                  Save to demo
                </button>
                <Link
                  href={`/farms/${farmId}/${section}`}
                  className="inline-flex min-h-11 items-center rounded-lg border border-stone-300 px-4 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
