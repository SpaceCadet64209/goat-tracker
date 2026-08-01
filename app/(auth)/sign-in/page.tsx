import Link from "next/link";

import { AuthForm } from "@/features/auth/auth-form";
import { signInAction } from "@/features/auth/actions";
import { getSafeReturnPath } from "@/lib/auth/return-path";

export default async function SignInPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ next?: string }> }>) {
  const { next } = await searchParams;
  const safeNext = getSafeReturnPath(next);
  return (
    <AuthPage title="Sign in">
      <AuthForm action={signInAction} next={safeNext} submitLabel="Sign in" />
      <p className="text-sm text-stone-600">
        <Link
          className="font-semibold text-emerald-800"
          href={`/forgot-password?next=${encodeURIComponent(safeNext)}`}
        >
          Forgot your password?
        </Link>
      </p>
      <p className="text-sm text-stone-600">
        New to GoatTrack?{" "}
        <Link
          className="font-semibold text-emerald-800"
          href={`/sign-up?next=${encodeURIComponent(safeNext)}`}
        >
          Create an account
        </Link>
        .
      </p>
    </AuthPage>
  );
}

export function AuthPage({
  title,
  children,
}: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="mx-auto max-w-md px-6 py-14">
      <h1 className="mb-7 text-3xl font-bold tracking-tight">{title}</h1>
      {children}
    </section>
  );
}
