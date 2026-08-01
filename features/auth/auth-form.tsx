"use client";

import { useActionState, useEffect } from "react";

import type { ActionResult } from "@/lib/errors";

type AuthSuccess = { next: string; message?: string };
type AuthAction = (formData: FormData) => Promise<ActionResult<AuthSuccess>>;

const initialState: ActionResult<AuthSuccess> | null = null;

export function AuthForm({
  action,
  submitLabel,
  includeConfirmation = false,
  emailOnly = false,
  next,
}: Readonly<{
  action: AuthAction;
  submitLabel: string;
  includeConfirmation?: boolean;
  emailOnly?: boolean;
  next?: string;
}>) {
  const [state, formAction, pending] = useActionState(
    async (_previous: ActionResult<AuthSuccess> | null, formData: FormData) =>
      action(formData),
    initialState,
  );

  useEffect(() => {
    if (state?.ok && !state.data.message)
      window.location.assign(state.data.next);
  }, [state]);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {next ? <input name="next" type="hidden" value={next} /> : null}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold" htmlFor="email">
          Email address
        </label>
        <input
          className="w-full rounded-md border border-stone-300 px-3 py-2.5"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <FieldError state={state} field="email" />
      </div>
      {!emailOnly ? (
        <div className="space-y-1.5">
          <label className="text-sm font-semibold" htmlFor="password">
            Password
          </label>
          <input
            className="w-full rounded-md border border-stone-300 px-3 py-2.5"
            id="password"
            name="password"
            type="password"
            autoComplete={
              includeConfirmation ? "new-password" : "current-password"
            }
            required
          />
          <FieldError state={state} field="password" />
        </div>
      ) : null}
      {includeConfirmation ? (
        <div className="space-y-1.5">
          <label className="text-sm font-semibold" htmlFor="confirmPassword">
            Confirm password
          </label>
          <input
            className="w-full rounded-md border border-stone-300 px-3 py-2.5"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
          />
          <FieldError state={state} field="confirmPassword" />
        </div>
      ) : null}
      {state && !state.ok ? (
        <p aria-live="polite" className="text-sm text-red-700">
          {state.message}
        </p>
      ) : null}
      {state?.ok && state.data.message ? (
        <p aria-live="polite" className="text-sm text-emerald-800">
          {state.data.message}
        </p>
      ) : null}
      <button
        className="min-h-11 w-full rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-50"
        disabled={pending}
        type="submit"
      >
        {pending ? "Please wait…" : submitLabel}
      </button>
    </form>
  );
}

function FieldError({
  state,
  field,
}: Readonly<{ state: ActionResult<AuthSuccess> | null; field: string }>) {
  if (!state || state.ok) return null;
  const messages = state.fieldErrors?.[field];
  return messages?.map((message) => (
    <p className="text-sm text-red-700" key={message}>
      {message}
    </p>
  ));
}
