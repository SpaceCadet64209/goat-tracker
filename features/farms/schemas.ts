import { z } from "zod";

export const farmIdSchema = z.uuid("The farm link is invalid.");

export const createFarmSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a farm name.")
    .max(120, "Farm names must be 120 characters or fewer."),
});
