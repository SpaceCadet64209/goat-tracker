"use client";

import { useActionState } from "react";

import { createFarmAndContinueAction } from "./actions";

export function CreateFarmForm() {
  const [state, action, pending] = useActionState(
    async (_previousState: unknown, formData: FormData) =>
      createFarmAndContinueAction(formData),
    null,
  );

  return (
    <form action={action} className="mt-6 space-y-5">
      <div>
        <label htmlFor="farm-name" className="text-sm font-semibold text-stone-800">
          Farm name
        </label>
        <input
          id="farm-name"
          name="name"
          required
          maxLength={120}
          autoComplete="organization"
          className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-stone-950 shadow-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
          aria-describedby={state && !state.ok ? "farm-name-error" : undefined}
        />
        {state && !state.ok ? (
          <p id="farm-name-error" role="alert" className="mt-2 text-sm text-red-700">
            {state.fieldErrors?.name?.[0] ?? state.message}
          </p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Creating farm…" : "Create farm"}
      </button>
    </form>
  );
}
