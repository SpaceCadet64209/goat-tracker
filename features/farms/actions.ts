"use server";

import { redirect } from "next/navigation";

import {
  actionSuccess,
  mapErrorToActionFailure,
  type ActionResult,
} from "@/lib/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { createFarmSchema } from "./schemas";

export async function createFarmAction(
  formData: FormData,
): Promise<ActionResult<{ farmId: string }>> {
  try {
    const input = createFarmSchema.parse({ name: formData.get("name") });
    const supabase = (await createSupabaseServerClient()) as unknown as {
      rpc: (
        functionName: string,
        parameters: { p_name: string },
      ) => Promise<{ data: string | null; error: unknown | null }>;
    };
    const { data, error } = await supabase.rpc("create_farm", {
      p_name: input.name,
    });
    if (error || !data) throw error ?? new Error("Farm creation failed.");
    return actionSuccess({ farmId: data });
  } catch (error) {
    return mapErrorToActionFailure(error);
  }
}

export async function createFarmAndContinueAction(formData: FormData) {
  const result = await createFarmAction(formData);
  if (result.ok) redirect(`/farms/${result.data.farmId}`);
  return result;
}
