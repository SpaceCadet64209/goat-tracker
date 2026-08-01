import { notFound } from "next/navigation";

import { FarmSection, isFarmSection } from "@/features/dashboard/farm-section";
import { requireFarmAccess } from "@/lib/auth/farm-authorization";

export default async function FarmSectionPage({
  params,
}: Readonly<{ params: Promise<{ farmId: string; section: string }> }>) {
  const { farmId, section } = await params;
  const farm = await requireFarmAccess(farmId);
  if (!isFarmSection(section)) notFound();
  return <FarmSection farmId={farm.id} section={section} />;
}
