import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FarmChoice = Readonly<{ id: string; name: string; role: string }>;

/** Returns only farms visible to the current JWT/RLS policy context. */
export async function getActiveFarmsForCurrentUser(): Promise<FarmChoice[]> {
  const supabase = (await createSupabaseServerClient()) as unknown as {
    from: (table: "farm_memberships") => {
      select: (columns: string) => {
        eq: (
          column: string,
          value: string,
        ) => {
          order: (
            column: string,
            options: { referencedTable: string; ascending: boolean },
          ) => Promise<{
            data: Array<{
              role: string;
              farms:
                | { id: string; name: string }
                | Array<{ id: string; name: string }>
                | null;
            }> | null;
            error: unknown | null;
          }>;
        };
      };
    };
  };
  const { data, error } = await supabase
    .from("farm_memberships")
    .select("role, farms!inner(id, name)")
    .eq("status", "active")
    .order("name", { referencedTable: "farms", ascending: true });

  if (error || !data) return [];
  return data.flatMap((membership) => {
    const farm = membership.farms;
    if (!farm || Array.isArray(farm)) return [];
    return [{ id: farm.id, name: farm.name, role: membership.role }];
  });
}
