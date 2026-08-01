import Link from "next/link";

import { signUpAction } from "@/features/auth/actions";
import { AuthForm } from "@/features/auth/auth-form";
import { getSafeReturnPath } from "@/lib/auth/return-path";

import { AuthPage } from "../sign-in/page";

export default async function SignUpPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ next?: string }> }>) {
  const { next } = await searchParams;
  return (
    <AuthPage title="Create your account">
      <AuthForm
        action={signUpAction}
        includeConfirmation
        next={getSafeReturnPath(next)}
        submitLabel="Create account"
      />
      <p className="mt-5 text-sm text-stone-600">
        Already registered?{" "}
        <Link className="font-semibold text-emerald-800" href="/sign-in">
          Sign in
        </Link>
        .
      </p>
    </AuthPage>
  );
}
