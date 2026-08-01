import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
}: Readonly<{ title: string; description: string }>) {
  return (
    <section
      aria-labelledby="empty-state-title"
      className="rounded-2xl border border-stone-200 bg-white px-6 py-14 text-center shadow-sm sm:px-12"
    >
      <Inbox
        aria-hidden="true"
        className="mx-auto size-10 text-stone-300"
        strokeWidth={1.6}
      />
      <h1
        id="empty-state-title"
        className="mt-5 text-xl font-bold tracking-tight text-stone-950"
      >
        {title}
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-pretty text-stone-600">
        {description}
      </p>
    </section>
  );
}
