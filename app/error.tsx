"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  useEffect(() => {
    console.error("Route error", { digest: error.digest });
  }, [error.digest]);

  return (
    <main
      className="mx-auto flex min-h-dvh max-w-2xl items-center px-4 py-8 sm:px-6"
      aria-labelledby="route-error-title"
    >
      <section className="w-full rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-sm font-bold tracking-[0.16em] text-red-700 uppercase">
          Something went wrong
        </p>
        <h1
          id="route-error-title"
          className="mt-3 text-3xl font-bold tracking-tight text-stone-950"
        >
          We could not load this page
        </h1>
        <p className="mt-3 text-stone-600">
          Your information is safe. Try again, or return to a known page.
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs text-stone-500">
            Reference: {error.digest}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="min-h-11 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white hover:bg-emerald-800"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-lg border border-stone-300 px-4 text-sm font-bold text-stone-800 hover:bg-stone-50"
          >
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
