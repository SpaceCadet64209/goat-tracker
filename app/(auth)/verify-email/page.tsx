import Link from "next/link";

import { AuthPage } from "../sign-in/page";

export default function VerifyEmailPage() {
  return (
    <AuthPage title="Verify your email">
      <p className="text-stone-600">
        Open the verification link we sent to your email address before
        accessing farm data.
      </p>
      <Link
        className="mt-5 inline-block font-semibold text-emerald-800"
        href="/sign-in"
      >
        Back to sign in
      </Link>
    </AuthPage>
  );
}
