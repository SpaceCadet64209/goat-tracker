"use client";

import {
  Search,
  SlidersHorizontal,
  Plus,
  X,
  MoreHorizontal,
  Weight,
} from "lucide-react";
import { useMemo, useState } from "react";
import { DemoGoat, demoGoats } from "./demo-data";

const statusStyles = {
  Breeding: "bg-emerald-50 text-emerald-800",
  Growing: "bg-sky-50 text-sky-800",
  Dry: "bg-stone-100 text-stone-700",
};

export function GoatRegister() {
  const [goats, setGoats] = useState(demoGoats);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | DemoGoat["sex"]>("All");
  const [open, setOpen] = useState(false);
  const visible = useMemo(
    () =>
      goats.filter(
        (goat) =>
          (filter === "All" || goat.sex === filter) &&
          `${goat.name} ${goat.tag} ${goat.breed}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [filter, goats, query],
  );

  function addGoat(formData: FormData) {
    const name = String(formData.get("name") || "New goat");
    const tag = String(
      formData.get("tag") ||
        `KBS-${String(goats.length + 36).padStart(3, "0")}`,
    );
    const sex = formData.get("sex") === "Buck" ? "Buck" : "Doe";
    setGoats((current) => [
      {
        id: crypto.randomUUID(),
        name,
        tag,
        sex,
        breed: String(formData.get("breed") || "Boer"),
        age: "New",
        status: "Growing",
        weight: 0,
        updated: "Just now",
        color: "bg-lime-100 text-lime-800",
      },
      ...current,
    ]);
    setOpen(false);
  }

  return (
    <div className="grid gap-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-700">
            Herd management
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
            Goat register
          </h1>
          <p className="mt-2 text-stone-600">
            {goats.length} goats in your active herd.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 font-semibold text-white shadow-sm hover:bg-emerald-800"
        >
          <Plus className="size-5" /> Add goat
        </button>
      </header>
      <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-stone-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block min-w-0 flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" />
            <span className="sr-only">Search goats</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, tag or breed"
              className="w-full rounded-lg border border-stone-200 py-2 pr-3 pl-9 text-sm outline-none focus:border-emerald-600"
            />
          </label>
          <div
            className="flex rounded-lg bg-stone-100 p-1"
            aria-label="Filter goats"
          >
            {(["All", "Doe", "Buck"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`min-h-8 rounded-md px-3 text-xs font-semibold ${filter === item ? "bg-white text-stone-950 shadow-sm" : "text-stone-500 hover:text-stone-800"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="hidden grid-cols-[minmax(11rem,1.5fr)_0.8fr_0.8fr_0.9fr_0.7fr_2.5rem] gap-3 border-b border-stone-100 px-5 py-3 text-xs font-bold tracking-wide text-stone-500 uppercase md:grid">
          <span>Animal</span>
          <span>Type</span>
          <span>Status</span>
          <span>Latest weight</span>
          <span>Updated</span>
          <span />
        </div>
        <div className="divide-y divide-stone-100">
          {visible.map((goat) => (
            <article
              key={goat.id}
              className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(11rem,1.5fr)_0.8fr_0.8fr_0.9fr_0.7fr_2.5rem] md:items-center md:px-5"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold ${goat.color}`}
                >
                  {goat.name.charAt(0)}
                </span>
                <div>
                  <p className="font-bold text-stone-900">{goat.name}</p>
                  <p className="text-xs text-stone-500">
                    {goat.tag} · {goat.breed}
                  </p>
                </div>
              </div>
              <p className="text-sm text-stone-700">{goat.sex}</p>
              <span
                className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[goat.status]}`}
              >
                {goat.status}
              </span>
              <p className="flex items-center gap-1 text-sm font-semibold text-stone-800">
                <Weight className="size-3.5 text-stone-400" />
                {goat.weight ? `${goat.weight} kg` : "No weight"}
              </p>
              <p className="text-sm text-stone-500">{goat.updated}</p>
              <button
                className="grid min-h-9 place-items-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                aria-label={`More options for ${goat.name}`}
              >
                <MoreHorizontal className="size-5" />
              </button>
            </article>
          ))}
          {!visible.length && (
            <p className="p-10 text-center text-sm text-stone-500">
              <SlidersHorizontal className="mx-auto mb-2 size-5" />
              No goats match that search.
            </p>
          )}
        </div>
      </section>
      {open && <GoatDialog onClose={() => setOpen(false)} onSubmit={addGoat} />}
    </div>
  );
}

function GoatDialog({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-stone-950/35 p-0 sm:place-items-center sm:p-5">
      <form
        action={onSubmit}
        className="w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-7"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-950">Add a goat</h2>
            <p className="mt-1 text-sm text-stone-600">
              Create a demo record for your register.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-lg hover:bg-stone-100"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Name" name="name" placeholder="e.g. Willow" required />
          <Field
            label="Tag number"
            name="tag"
            placeholder="e.g. KBS-036"
            required
          />
          <Field label="Breed" name="breed" placeholder="Boer" />
          <label className="grid gap-1.5 text-sm font-semibold text-stone-700">
            Sex
            <select
              name="sex"
              className="rounded-lg border border-stone-300 bg-white px-3 py-2"
            >
              <option>Doe</option>
              <option>Buck</option>
            </select>
          </label>
        </div>
        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 font-semibold text-stone-700 hover:bg-stone-100"
          >
            Cancel
          </button>
          <button className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800">
            Add goat
          </button>
        </div>
      </form>
    </div>
  );
}
function Field({
  label,
  ...props
}: React.ComponentProps<"input"> & { label: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-stone-700">
      {label}
      <input
        {...props}
        className="rounded-lg border border-stone-300 px-3 py-2 font-normal outline-none focus:border-emerald-600"
      />
    </label>
  );
}
