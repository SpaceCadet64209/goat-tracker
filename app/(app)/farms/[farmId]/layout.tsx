import { ApplicationShell } from "@/components/app-shell/application-shell";
import { requireFarmAccess } from "@/lib/auth/farm-authorization";

export default function FarmLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ farmId: string }>;
}>) {
  return <FarmShell params={params}>{children}</FarmShell>;
}

async function FarmShell({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ farmId: string }>;
}>) {
  const { farmId } = await params;
  const farm = await requireFarmAccess(farmId);

  return <ApplicationShell farmId={farm.id} farmName={farm.name}>{children}</ApplicationShell>;
}
