"use client";

export default function GlobalError({
  reset,
}: Readonly<{ reset: () => void }>) {
  return (
    <html lang="en-ZA">
      <body className="bg-stone-50 text-stone-950">
        <main
          className="mx-auto flex min-h-dvh max-w-2xl items-center px-4 py-8 sm:px-6"
          aria-labelledby="global-error-title"
        >
          <section className="w-full rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:p-10">
            <p className="text-sm font-bold tracking-[0.16em] text-red-700 uppercase">
              Application unavailable
            </p>
            <h1
              id="global-error-title"
              className="mt-3 text-3xl font-bold tracking-tight"
            >
              We need to restart this page
            </h1>
            <p className="mt-3 text-stone-600">
              No farm data is shown while the application recovers.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 min-h-11 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white hover:bg-emerald-800"
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
