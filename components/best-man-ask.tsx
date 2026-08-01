"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Heart } from "lucide-react";

type Phase = "ask" | "accepted";

export function ExploreWithBestManAsk() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("ask");
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && phase === "ask") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, phase]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  function openAsk(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setPhase("ask");
    setOpen(true);
  }

  function accept() {
    setPhase("accepted");
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      router.push("/demo");
    }, 1600);
  }

  function skipToDemo() {
    setOpen(false);
    router.push("/demo");
  }

  const dialog =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-stone-950/55 p-4 backdrop-blur-[2px] sm:items-center"
            role="presentation"
            onClick={() => {
              if (phase === "ask") setOpen(false);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-stone-200 bg-[#fbfaf6] shadow-2xl shadow-stone-950/25"
              style={{ animation: "bestManAskIn 280ms ease-out" }}
              onClick={(event) => event.stopPropagation()}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full bg-emerald-200/50 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-24 -left-10 size-48 rounded-full bg-rose-200/40 blur-3xl"
              />

              <div className="relative px-6 pt-7 pb-6 sm:px-8 sm:pt-8 sm:pb-8">
                {phase === "ask" ? (
                  <>
                    <div className="flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-emerald-800 uppercase">
                      <span className="grid size-7 place-items-center rounded-full bg-rose-100 text-rose-600">
                        <Heart className="size-3.5 fill-current" />
                      </span>
                      One more thing
                    </div>
                    <h2
                      id={titleId}
                      className="mt-5 text-3xl font-bold tracking-[-0.04em] text-stone-950 sm:text-4xl"
                    >
                      Will you be my best man?
                    </h2>
                    <p className="mt-4 text-base leading-7 text-stone-600">
                      I built this for you — but before you dig into the herd, I
                      need to ask the important question. Stand with me on the
                      big day?
                    </p>
                    <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
                      <button
                        type="button"
                        onClick={accept}
                        className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-bold text-white hover:bg-stone-800"
                      >
                        Yes — I&apos;d be honoured
                      </button>
                      <button
                        type="button"
                        onClick={accept}
                        className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-xl border border-stone-300 bg-white px-4 text-sm font-bold text-stone-800 hover:bg-stone-50"
                      >
                        Obviously
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={skipToDemo}
                      className="mt-4 w-full cursor-pointer py-2 text-center text-sm font-semibold text-stone-400 hover:text-stone-600"
                    >
                      Maybe later — just show me the demo
                    </button>
                  </>
                ) : (
                  <div className="py-6 text-center sm:py-8">
                    <div className="mx-auto grid size-14 place-items-center rounded-full bg-rose-100 text-rose-600">
                      <Heart className="size-7 fill-current" />
                    </div>
                    <h2
                      id={titleId}
                      className="mt-5 text-3xl font-bold tracking-[-0.04em] text-stone-950"
                    >
                      That means everything.
                    </h2>
                    <p className="mt-3 text-base leading-7 text-stone-600">
                      Thank you. Now go meet the herd — I&apos;ll see you at the
                      front.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={openAsk}
        className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-700/15 hover:bg-emerald-800"
      >
        Explore the demo <ArrowRight className="size-4" />
      </button>
      {dialog}
    </>
  );
}
