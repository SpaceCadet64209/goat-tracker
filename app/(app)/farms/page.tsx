import Link from "next/link";
import { redirect } from "next/navigation";

import { getActiveFarmsForCurrentUser } from "@/features/farms/queries";

export default async function FarmEntryPage() {
  const farms = await getActiveFarmsForCurrentUser();
  if (farms.length === 0) redirect("/farms/new");
  if (farms.length === 1) redirect(`/farms/${farms[0]!.id}`);

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-stone-950">Choose a farm</h1>
      <p className="mt-2 text-sm leading-6 text-stone-600">
        Select the farm you want to work in. Each link opens an explicit farm context.
      </p>
      <ul className="mt-6 divide-y divide-stone-200 rounded-xl border border-stone-200">
        {farms.map((farm) => (
          <li key={farm.id}>
            <Link
              href={`/farms/${farm.id}`}
              className="flex min-h-14 items-center justify-between gap-4 px-4 font-semibold text-stone-900 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-700"
            >
              <span>{farm.name}</span>
              <span className="rounded-full bg-stone-100 px-2 py-1 text-xs font-medium capitalize text-stone-600">
                {farm.role}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
