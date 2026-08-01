"use server";

import { revalidatePath } from "next/cache";

import { requireFarmRole } from "@/lib/auth/farm-authorization";
import {
  actionSuccess,
  mapErrorToActionFailure,
  type ActionResult,
} from "@/lib/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  farmFileUploadSchema,
  getFarmFileExtension,
  sanitizeFarmFileDisplayName,
} from "./schemas";

const maximumFileSize = 10 * 1024 * 1024;

type FarmFile = {
  id: string;
  farm_id: string;
  object_path: string;
  status:
    | "pending_upload"
    | "available"
    | "upload_failed"
    | "delete_pending"
    | "deleted";
};

function hasExpectedFileSignature(
  bytes: Uint8Array,
  mimeType: string,
): boolean {
  if (mimeType === "image/jpeg")
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png")
    return bytes
      .slice(0, 8)
      .every(
        (value, index) => value === [137, 80, 78, 71, 13, 10, 26, 10][index],
      );
  if (mimeType === "application/pdf")
    return String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
  return false;
}

async function requireFileManager(farmId: string) {
  return requireFarmRole(farmId, ["owner", "manager"]);
}

export async function uploadFarmFileAction(
  _previousState: ActionResult<{ fileId: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ fileId: string }>> {
  let pendingFile: FarmFile | undefined;
  try {
    const input = farmFileUploadSchema.parse({
      farmId: formData.get("farmId"),
      logicalArea: formData.get("logicalArea"),
    });
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0)
      throw new Error("Choose a file to upload.");
    if (file.size > maximumFileSize)
      throw new Error("Files must be 10 MB or smaller.");
    const extension = getFarmFileExtension(file.type);
    if (!extension)
      throw new Error("Only JPEG, PNG, and PDF files are supported.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!hasExpectedFileSignature(bytes, file.type))
      throw new Error("The file content does not match its type.");

    await requireFarmRole(input.farmId, ["owner", "manager", "worker"]);
    const objectId = crypto.randomUUID();
    const objectPath = `${input.farmId}/${input.logicalArea}/${objectId}.${extension}`;
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user)
      throw userError ?? new Error("Authentication is required.");
    const { data, error } = await supabase
      .from("farm_files")
      .insert({
        farm_id: input.farmId,
        object_path: objectPath,
        logical_area: input.logicalArea,
        display_name: sanitizeFarmFileDisplayName(file.name),
        mime_type: file.type,
        byte_size: file.size,
        uploaded_by: userData.user.id,
        status: "pending_upload",
      })
      .select("id, farm_id, object_path, status")
      .single();
    if (error || !data)
      throw error ?? new Error("File metadata could not be created.");
    pendingFile = data as FarmFile;

    const upload = await supabase.storage
      .from("farm-files")
      .upload(objectPath, bytes, {
        contentType: file.type,
        upsert: false,
      });
    if (upload.error) {
      await supabase
        .from("farm_files")
        .update({ status: "upload_failed" })
        .eq("id", pendingFile.id);
      throw upload.error;
    }
    const completion = await supabase
      .from("farm_files")
      .update({ status: "available" })
      .eq("id", pendingFile.id);
    if (completion.error) throw completion.error;
    revalidatePath(`/farms/${input.farmId}`);
    return actionSuccess({ fileId: pendingFile.id });
  } catch (error) {
    return mapErrorToActionFailure(error);
  }
}

export async function deleteFarmFileAction(
  fileId: string,
  farmId: string,
): Promise<ActionResult<Record<string, never>>> {
  try {
    await requireFileManager(farmId);
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("farm_files")
      .update({ status: "delete_pending" })
      .eq("id", fileId)
      .eq("farm_id", farmId)
      .select("id, farm_id, object_path, status")
      .single();
    if (error || !data) throw error ?? new Error("File was not found.");
    const pending = data as FarmFile;
    const removal = await supabase.storage
      .from("farm-files")
      .remove([pending.object_path]);
    if (removal.error) throw removal.error;
    const completion = await supabase
      .from("farm_files")
      .update({ status: "deleted", deleted_at: new Date().toISOString() })
      .eq("id", pending.id);
    if (completion.error) throw completion.error;
    revalidatePath(`/farms/${farmId}`);
    return actionSuccess({});
  } catch (error) {
    return mapErrorToActionFailure(error);
  }
}

/** Replays a deletion left in delete_pending after an object/metadata failure. */
export async function reconcileFarmFileDeletionAction(
  fileId: string,
  farmId: string,
): Promise<ActionResult<Record<string, never>>> {
  try {
    await requireFileManager(farmId);
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("farm_files")
      .select("id, farm_id, object_path, status")
      .eq("id", fileId)
      .eq("farm_id", farmId)
      .eq("status", "delete_pending")
      .single();
    if (error || !data)
      throw error ?? new Error("No pending deletion was found.");
    const pending = data as FarmFile;
    const removal = await supabase.storage
      .from("farm-files")
      .remove([pending.object_path]);
    if (removal.error) throw removal.error;
    const completion = await supabase
      .from("farm_files")
      .update({ status: "deleted", deleted_at: new Date().toISOString() })
      .eq("id", pending.id);
    if (completion.error) throw completion.error;
    revalidatePath(`/farms/${farmId}`);
    return actionSuccess({});
  } catch (error) {
    return mapErrorToActionFailure(error);
  }
}
