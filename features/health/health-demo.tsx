"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  MoreHorizontal,
  Plus,
  Syringe,
  Tag,
  X,
} from "lucide-react";

type Vaccination = {
  id: number;
  name: string;
  protects: string;
  interval: string;
  stock: string;
  tone: string;
};

const starterVaccinations: Vaccination[] = [
  {
    id: 1,
    name: "Multivax P Plus",
    protects: "Clostridial diseases",
    interval: "Every 6 months",
    stock: "18 doses",
    tone: "bg-violet-100 text-violet-700",
  },
  {
    id: 2,
    name: "Pasteurella",
    protects: "Pneumonia & pasteurellosis",
    interval: "Annual booster",
    stock: "12 doses",
    tone: "bg-sky-100 text-sky-700",
  },
  {
    id: 3,
    name: "Bluetongue",
    protects: "Bluetongue virus",
    interval: "Annual booster",
    stock: "6 doses",
    tone: "bg-amber-100 text-amber-700",
  },
];

const programs = [
  {
    name: "Kid starter programme",
    group: "Kids",
    status: "Active",
    doses: 3,
    next: "Multivax P Plus · 14 Aug",
    progress: 2,
    color: "bg-emerald-600",
  },
  {
    name: "Breeding herd annual",
    group: "Does & bucks",
    status: "Active",
    doses: 2,
    next: "Bluetongue · 03 Sep",
    progress: 1,
    color: "bg-teal-600",
  },
  {
    name: "New arrivals protocol",
    group: "Quarantine pen",
    status: "Draft",
    doses: 4,
    next: "Not scheduled",
    progress: 0,
    color: "bg-stone-400",
  },
];

function AddVaccination({
  onClose,
  onSave,
}: Readonly<{
  onClose: () => void;
  onSave: (name: string, protects: string) => void;
}>) {
  const [name, setName] = useState("");
  const [protects, setProtects] = useState("");
  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-950">
            Add a vaccination
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            This is saved in the demo for this browser session.
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close form"
          className="rounded-lg p-2 text-stone-500 hover:bg-white"
        >
          <X className="size-5" />
        </button>
      </div>
      <form
        className="mt-5 grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim())
            onSave(name.trim(), protects.trim() || "General herd health");
        }}
      >
        <label className="grid gap-1.5 text-sm font-semibold text-stone-800">
          Vaccine name
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Ovipast Plus"
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 font-normal outline-none focus:border-emerald-700"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-stone-800">
          Protects against
          <input
            value={protects}
            onChange={(event) => setProtects(event.target.value)}
            placeholder="e.g. Pasteurellosis"
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 font-normal outline-none focus:border-emerald-700"
          />
        </label>
        <div className="flex gap-3 sm:col-span-2">
          <button className="min-h-11 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">
            Add to library
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-lg px-3 text-sm font-semibold text-stone-700 hover:bg-white"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

export function VaccinationsDemo({ farmId }: Readonly<{ farmId: string }>) {
  const [items, setItems] = useState(starterVaccinations);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("");
  const displayed = useMemo(
    () =>
      items.filter(
        (item) =>
          item.name.toLowerCase().includes(filter.toLowerCase()) ||
          item.protects.toLowerCase().includes(filter.toLowerCase()),
      ),
    [filter, items],
  );
  return (
    <div className="grid gap-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold tracking-[0.14em] text-emerald-700 uppercase">
            Herd health
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
            Vaccinations
          </h1>
          <p className="mt-2 text-stone-600">
            Your vaccine library and upcoming herd-health work.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 font-semibold text-white shadow-sm hover:bg-emerald-800"
        >
          <Plus className="size-5" />
          Add vaccination
        </button>
      </header>
      {showForm && (
        <AddVaccination
          onClose={() => setShowForm(false)}
          onSave={(name, protects) => {
            setItems((current) => [
              {
                id: Date.now(),
                name,
                protects,
                interval: "Set an interval",
                stock: "0 doses",
                tone: "bg-rose-100 text-rose-700",
              },
              ...current,
            ]);
            setShowForm(false);
          }}
        />
      )}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-emerald-800 p-5 text-white shadow-sm">
          <p className="text-sm font-semibold text-emerald-100">
            Due this month
          </p>
          <p className="mt-2 text-3xl font-bold">7 goats</p>
          <p className="mt-3 inline-flex items-center gap-1 text-sm text-emerald-100">
            <CalendarDays className="size-4" /> Next clinic: 14 Aug
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-stone-500">Vaccine types</p>
          <p className="mt-2 text-3xl font-bold text-stone-950">
            {items.length}
          </p>
          <p className="mt-3 text-sm text-stone-600">In your library</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900">
            <CircleAlert className="size-4" /> Low stock
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-950">1 vaccine</p>
          <p className="mt-3 text-sm text-amber-800">
            Bluetongue has 6 doses left
          </p>
        </div>
      </section>
      <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-stone-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-stone-950">Vaccine library</h2>
            <p className="text-sm text-stone-600">
              Use these in programmes and health records.
            </p>
          </div>
          <input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Search vaccines"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-700 sm:w-52"
          />
        </div>
        <div className="divide-y divide-stone-100">
          {displayed.map((item) => (
            <article
              key={item.id}
              className="flex items-center gap-3 p-4 sm:p-5"
            >
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-xl ${item.tone}`}
              >
                <Syringe className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-stone-900">{item.name}</h3>
                <p className="truncate text-sm text-stone-600">
                  {item.protects}
                </p>
              </div>
              <div className="hidden text-right text-sm sm:block">
                <p className="font-medium text-stone-800">{item.interval}</p>
                <p className="text-stone-500">{item.stock} in stock</p>
              </div>
              <button
                aria-label={`More options for ${item.name}`}
                className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"
              >
                <MoreHorizontal className="size-5" />
              </button>
            </article>
          ))}
          {displayed.length === 0 && (
            <p className="p-8 text-center text-sm text-stone-500">
              No vaccinations match that search.
            </p>
          )}
        </div>
      </section>
      <a
        href={`/farms/${farmId}/programs`}
        className="group flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-emerald-300"
      >
        <span>
          <span className="inline-flex items-center gap-2 font-bold text-stone-950">
            <ClipboardCheck className="size-5 text-emerald-700" />
            Build a vaccination programme
          </span>
          <span className="mt-1 block text-sm text-stone-600">
            Turn your library into a clear schedule for every group.
          </span>
        </span>
        <ChevronRight className="size-5 text-stone-400 group-hover:text-emerald-700" />
      </a>
    </div>
  );
}

export function ProgramsDemo({ farmId }: Readonly<{ farmId: string }>) {
  const [active, setActive] = useState("All programmes");
  const [showBuilder, setShowBuilder] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  const shown =
    active === "All programmes"
      ? programs
      : programs.filter((program) => program.status === active.slice(0, -1));
  return (
    <div className="grid gap-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold tracking-[0.14em] text-emerald-700 uppercase">
            Herd health
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
            Vaccination programmes
          </h1>
          <p className="mt-2 text-stone-600">
            Simple, repeatable schedules for each herd group.
          </p>
        </div>
        <button
          onClick={() => setShowBuilder((value) => !value)}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 font-semibold text-white shadow-sm hover:bg-emerald-800"
        >
          <Plus className="size-5" />
          New programme
        </button>
      </header>
      {showBuilder && (
        <ProgrammeBuilder
          onCancel={() => setShowBuilder(false)}
          onCreate={(name) => {
            setCreated(name);
            setShowBuilder(false);
          }}
        />
      )}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-stone-500">
            Active programmes
          </p>
          <p className="mt-2 text-3xl font-bold text-stone-950">2</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-stone-500">Goats covered</p>
          <p className="mt-2 text-3xl font-bold text-stone-950">46</p>
        </div>
        <div className="rounded-2xl bg-stone-900 p-5 text-white">
          <p className="text-sm font-semibold text-stone-300">
            Next programme day
          </p>
          <p className="mt-2 text-xl font-bold">14 August</p>
          <p className="mt-1 text-sm text-stone-300">7 kids due</p>
        </div>
      </section>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["All programmes", "Active", "Drafts"].map((label) => (
          <button
            key={label}
            onClick={() => setActive(label)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${active === label ? "bg-emerald-700 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <section className="grid gap-4 lg:grid-cols-3">
        {shown.map((program) => (
          <article
            key={program.name}
            className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <Tag className="size-5" />
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${program.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"}`}
              >
                {program.status}
              </span>
            </div>
            <h2 className="mt-5 text-lg font-bold text-stone-950">
              {program.name}
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              {program.group} · {program.doses} doses
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-stone-100">
              <div
                className={`h-full rounded-full ${program.color}`}
                style={{
                  width: `${(program.progress / program.doses) * 100}%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs font-medium text-stone-500">
              {program.progress} of {program.doses} dose types scheduled
            </p>
            <div className="mt-5 flex items-center gap-2 border-t border-stone-100 pt-4 text-sm text-stone-600">
              <Clock3 className="size-4 text-emerald-700" />
              <span className="truncate">{program.next}</span>
            </div>
          </article>
        ))}
        {created && (
          <article className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-white text-emerald-700">
              <Check className="size-5" />
            </span>
            <h2 className="mt-5 text-lg font-bold text-emerald-950">
              {created}
            </h2>
            <p className="mt-1 text-sm text-emerald-800">
              Created in this demo. Connect it to the data layer when you’re
              ready.
            </p>
          </article>
        )}
      </section>
      <a
        href={`/farms/${farmId}/vaccinations`}
        className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        ← Manage vaccine library
      </a>
    </div>
  );
}

function ProgrammeBuilder({
  onCancel,
  onCreate,
}: Readonly<{ onCancel: () => void; onCreate: (name: string) => void }>) {
  const [name, setName] = useState("");
  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 sm:p-6">
      <h2 className="text-lg font-bold text-stone-950">Create a programme</h2>
      <p className="mt-1 text-sm text-stone-600">
        Set up the basics now; dose scheduling can come next.
      </p>
      <form
        className="mt-5 grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim()) onCreate(name.trim());
        }}
      >
        <label className="grid gap-1.5 text-sm font-semibold text-stone-800">
          Programme name
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Doe pre-breeding"
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 font-normal outline-none focus:border-emerald-700"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-stone-800">
          Herd group
          <select className="rounded-lg border border-stone-300 bg-white px-3 py-2 font-normal outline-none focus:border-emerald-700">
            <option>Does & bucks</option>
            <option>Kids</option>
            <option>Quarantine pen</option>
          </select>
        </label>
        <div className="flex gap-3 sm:col-span-2">
          <button className="min-h-11 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">
            Create programme
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 rounded-lg px-3 text-sm font-semibold text-stone-700 hover:bg-white"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
