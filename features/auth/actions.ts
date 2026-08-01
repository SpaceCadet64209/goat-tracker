"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  actionFailure,
  actionSuccess,
  mapErrorToActionFailure,
  type ActionResult,
} from "@/lib/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  passwordRecoverySchema,
  passwordUpdateSchema,
  signInSchema,
  signUpSchema,
} from "./schemas";

type AuthSuccess = { next: string; message?: string };

function formValues(formData: FormData): Record<string, string> {
  return Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [
      key,
      typeof value === "string" ? value : "",
    ]),
  );
}

async function requestOrigin(): Promise<string> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

export async function signUpAction(
  formData: FormData,
): Promise<ActionResult<AuthSuccess>> {
  try {
    const input = signUpSchema.parse(formValues(formData));
    const supabase = await createSupabaseServerClient();
    const origin = await requestOrigin();
    const { error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(input.next)}`,
      },
    });
    if (error)
      return actionFailure("UNEXPECTED_ERROR", {
        message: "We could not start sign-up. Please try again.",
      });
    return actionSuccess({
      next: input.next,
      message: "Check your email to verify your account.",
    });
  } catch (error) {
    return mapErrorToActionFailure(error);
  }
}

export async function signInAction(
  formData: FormData,
): Promise<ActionResult<AuthSuccess>> {
  try {
    const input = signInSchema.parse(formValues(formData));
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });
    if (error)
      return actionFailure("AUTHENTICATION_REQUIRED", {
        message: "Unable to sign in with those credentials.",
      });
    return actionSuccess({ next: input.next });
  } catch (error) {
    return mapErrorToActionFailure(error);
  }
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

export async function requestPasswordRecoveryAction(
  formData: FormData,
): Promise<ActionResult<AuthSuccess>> {
  try {
    const input = passwordRecoverySchema.parse(formValues(formData));
    const supabase = await createSupabaseServerClient();
    const origin = await requestOrigin();
    const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(`/reset-password?next=${input.next}`)}`,
    });
    if (error)
      return actionFailure("UNEXPECTED_ERROR", {
        message: "We could not start password recovery. Please try again.",
      });
    // Same response whether or not the email is registered.
    return actionSuccess({
      next: input.next,
      message: "If an account exists, a recovery email is on its way.",
    });
  } catch (error) {
    return mapErrorToActionFailure(error);
  }
}

export async function updatePasswordAction(
  formData: FormData,
): Promise<ActionResult<AuthSuccess>> {
  try {
    const input = passwordUpdateSchema.parse(formValues(formData));
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user)
      return actionFailure("AUTHENTICATION_REQUIRED", {
        message: "Your recovery link has expired. Request another one.",
      });
    const update = await supabase.auth.updateUser({ password: input.password });
    if (update.error)
      return actionFailure("AUTHENTICATION_REQUIRED", {
        message: "Your recovery link has expired. Request another one.",
      });
    return actionSuccess({
      next: "/farms",
      message: "Your password has been updated.",
    });
  } catch (error) {
    return error instanceof z.ZodError
      ? mapErrorToActionFailure(error)
      : actionFailure("UNEXPECTED_ERROR");
  }
}
