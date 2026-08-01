import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { isFarmSection } from "@/features/dashboard/farm-section";
import { HealthNewRecord } from "@/features/health/health-new-record";
import { requireFarmAccess } from "@/lib/auth/farm-authorization";

const labels = {
  goats: "Add goat",
  weigh: "Log a weigh-in",
  vaccinations: "Add vaccination",
  programs: "Create vaccination program",
} as const;

export default async function NewFarmRecordPage({
  params,
}: Readonly<{ params: Promise<{ farmId: string; section: string }> }>) {
  const { farmId, section } = await params;
  const farm = await requireFarmAccess(farmId);
  if (!isFarmSection(section)) notFound();
  if (section === "vaccinations" || section === "programs") {
    return <HealthNewRecord farmId={farm.id} section={section} />;
  }
  const title = labels[section];
  return (
    <section className="mx-auto max-w-xl">
      <Link
        href={`/farms/${farm.id}/${section}`}
        className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        ← Back to {section}
      </Link>
      <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
        <h1 className="text-2xl font-bold tracking-tight text-stone-950">
          {title}
        </h1>
        <p className="mt-2 text-stone-600">
          This frontend form is ready for the next data-layer change.
        </p>
        <form className="mt-7 grid gap-5" action="#">
          <label className="grid gap-2 text-sm font-semibold text-stone-800">
            Name
            <input
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none placeholder:text-stone-400 focus:border-emerald-700"
              placeholder="Enter a name"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-stone-800">
            Notes <span className="font-normal text-stone-500">(optional)</span>
            <textarea
              className="min-h-28 rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none placeholder:text-stone-400 focus:border-emerald-700"
              placeholder="Add any helpful details"
            />
          </label>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button type="button">Save {title.toLowerCase()}</Button>
            <Button asChild type="button" variant="outline">
              <Link href={`/farms/${farm.id}/${section}`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
