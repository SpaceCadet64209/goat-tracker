import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FarmFileView = Readonly<{
  id: string;
  displayName: string;
  mimeType: string;
  status: "available" | "delete_pending";
  downloadUrl: string | null;
}>;

/** Returns only the current member's RLS-visible file metadata and signed links. */
export async function getFarmFilesForCurrentUser(farmId: string): Promise<FarmFileView[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("farm_files")
    .select("id, object_path, display_name, mime_type, status")
    .eq("farm_id", farmId)
    .in("status", ["available", "delete_pending"])
    .order("created_at", { ascending: false });
  if (error || !data) return [];

  return Promise.all(
    data.map(async (file) => {
      const signed =
        file.status === "available"
          ? await supabase.storage.from("farm-files").createSignedUrl(file.object_path, 60)
          : { data: null };
      return {
        id: file.id,
        displayName: file.display_name,
        mimeType: file.mime_type,
        status: file.status as "available" | "delete_pending",
        downloadUrl: signed.data?.signedUrl ?? null,
      };
    }),
  );
}
