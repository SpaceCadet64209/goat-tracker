import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

import { farmIdSchema } from "@/features/farms/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FarmAccess = Readonly<{
  id: string;
  name: string;
  role: "owner" | "manager" | "worker";
}>;

function userClient(client: unknown): SupabaseClient {
  // Generated database types are intentionally updated only by the schema
  // generation workflow. This narrow cast keeps normal requests under the JWT.
  return client as SupabaseClient;
}

/** Validates the URL and confirms active membership before a route renders. */
export async function requireFarmAccess(farmId: string): Promise<FarmAccess> {
  const parsed = farmIdSchema.safeParse(farmId);
  if (!parsed.success) notFound();

  const supabase = userClient(await createSupabaseServerClient());
  const { data, error } = await supabase
    .from("farm_memberships")
    .select("role, farms!inner(id, name)")
    .eq("farm_id", parsed.data)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data || !data.farms || Array.isArray(data.farms)) notFound();
  const farm = data.farms as { id: string; name: string };
  const role = data.role as FarmAccess["role"];
  if (!farmIdSchema.safeParse(farm.id).success) notFound();
  return { id: farm.id, name: farm.name, role };
}

/** Friendly server-side role check; RLS remains the enforcement boundary. */
export async function requireFarmRole(
  farmId: string,
  allowedRoles: readonly FarmAccess["role"][],
): Promise<FarmAccess> {
  const access = await requireFarmAccess(farmId);
  if (!allowedRoles.includes(access.role)) notFound();
  return access;
}
