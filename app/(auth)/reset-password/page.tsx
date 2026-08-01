import { updatePasswordAction } from "@/features/auth/actions";
import { AuthForm } from "@/features/auth/auth-form";

import { AuthPage } from "../sign-in/page";

export default function ResetPasswordPage() {
  return (
    <AuthPage title="Choose a new password">
      <AuthForm
        action={updatePasswordAction}
        includeConfirmation
        submitLabel="Update password"
      />
    </AuthPage>
  );
}
