export default function Loading() {
  return (
    <main
      className="mx-auto flex min-h-dvh max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <section className="w-full rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-stone-800">Loading page</p>
        <p className="mt-1 text-sm text-stone-600">
          Please wait while we prepare this area.
        </p>
        <div
          aria-hidden="true"
          className="mt-5 h-2 w-full animate-pulse rounded-full bg-stone-200"
        />
      </section>
    </main>
  );
}
