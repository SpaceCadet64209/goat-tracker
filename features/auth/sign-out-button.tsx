"use client";

import { signOutAction } from "./actions";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        className="min-h-11 rounded-lg px-3 text-sm font-semibold text-stone-700 hover:bg-stone-100"
        type="submit"
      >
        Sign out
      </button>
    </form>
  );
}
