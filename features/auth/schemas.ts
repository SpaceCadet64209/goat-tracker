import { z } from "zod";

import { getSafeReturnPath } from "../../lib/auth/return-path";

const email = z.string().trim().email("Enter a valid email address.").max(254);
const password = z.string().min(8, "Use at least 8 characters.").max(72);

const returnPath = z
  .string()
  .optional()
  .transform((value) => getSafeReturnPath(value));

export const signUpSchema = z
  .object({ email, password, confirmPassword: password, next: returnPath })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match.",
  });

export const signInSchema = z.object({ email, password, next: returnPath });

export const passwordRecoverySchema = z.object({ email, next: returnPath });

export const passwordUpdateSchema = z
  .object({ password, confirmPassword: password })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match.",
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
