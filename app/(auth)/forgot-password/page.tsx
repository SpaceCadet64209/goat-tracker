import Link from "next/link";

import { requestPasswordRecoveryAction } from "@/features/auth/actions";
import { AuthForm } from "@/features/auth/auth-form";
import { getSafeReturnPath } from "@/lib/auth/return-path";

import { AuthPage } from "../sign-in/page";

export default async function ForgotPasswordPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ next?: string }> }>) {
  const { next } = await searchParams;
  return (
    <AuthPage title="Reset your password">
      <p className="mb-5 text-stone-600">
        We will email you a recovery link if an account exists for this address.
      </p>
      <AuthForm
        action={requestPasswordRecoveryAction}
        emailOnly
        next={getSafeReturnPath(next)}
        submitLabel="Send recovery email"
      />
      <p className="mt-5 text-sm">
        <Link className="font-semibold text-emerald-800" href="/sign-in">
          Back to sign in
        </Link>
      </p>
    </AuthPage>
  );
}
