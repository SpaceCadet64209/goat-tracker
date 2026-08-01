import { z } from "zod";

export const allowedFarmFileTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
} as const;

export type AllowedFarmFileType = keyof typeof allowedFarmFileTypes;

export const farmFileUploadSchema = z.object({
  farmId: z.uuid("The farm link is invalid."),
  logicalArea: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{1,40}$/, "Choose a valid file area."),
});

export function getFarmFileExtension(type: string): string | null {
  return allowedFarmFileTypes[type as AllowedFarmFileType] ?? null;
}

export function sanitizeFarmFileDisplayName(name: string): string {
  const cleaned = name
    .replace(/[\\/\0-\x1f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (cleaned || "Uploaded file").slice(0, 120);
}
