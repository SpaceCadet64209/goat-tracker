import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="mx-auto flex min-h-dvh max-w-2xl items-center px-4 py-8 sm:px-6"
      aria-labelledby="not-found-title"
    >
      <section className="w-full rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-sm font-bold tracking-[0.16em] text-emerald-700 uppercase">
          404
        </p>
        <h1
          id="not-found-title"
          className="mt-3 text-3xl font-bold tracking-tight text-stone-950"
        >
          Page not found
        </h1>
        <p className="mt-3 text-stone-600">
          The page may have moved, or the link is no longer available to your
          account.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white hover:bg-emerald-800"
        >
          Return home
        </Link>
      </section>
    </main>
  );
}
