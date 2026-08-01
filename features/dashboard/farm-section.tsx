import { ProgramsDemo, VaccinationsDemo } from "@/features/health/health-demo";
import { GoatRegister } from "@/features/herd/goat-register";
import { WeighIns } from "@/features/herd/weigh-ins";

export type FarmSectionKey = "goats" | "weigh" | "vaccinations" | "programs";

export function isFarmSection(value: string): value is FarmSectionKey {
  return ["goats", "weigh", "vaccinations", "programs"].includes(value);
}

export function FarmSection({
  farmId,
  section,
}: Readonly<{ farmId: string; section: FarmSectionKey }>) {
  if (section === "goats") return <GoatRegister />;
  if (section === "weigh") return <WeighIns />;
  if (section === "vaccinations") return <VaccinationsDemo farmId={farmId} />;
  return <ProgramsDemo farmId={farmId} />;
}
