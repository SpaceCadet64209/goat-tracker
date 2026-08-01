import { CreateFarmForm } from "@/features/farms/create-farm-form";
import { getActiveFarmsForCurrentUser } from "@/features/farms/queries";
import { redirect } from "next/navigation";

export default async function NewFarmPage() {
  const farms = await getActiveFarmsForCurrentUser();
  if (farms.length > 0) redirect("/farms");

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-stone-950">
        Create your first farm
      </h1>
      <p className="mt-2 text-sm leading-6 text-stone-600">
        You will be added as this farm’s owner when it is created.
      </p>
      <CreateFarmForm />
    </section>
  );
}
