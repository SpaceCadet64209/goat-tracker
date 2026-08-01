import { FarmDashboard } from "@/features/dashboard/farm-dashboard";
import { requireFarmAccess } from "@/lib/auth/farm-authorization";

export default async function FarmHomePage({
  params,
}: Readonly<{ params: Promise<{ farmId: string }> }>) {
  const { farmId } = await params;
  const farm = await requireFarmAccess(farmId);
  return <FarmDashboard farmName={farm.name} />;
}
