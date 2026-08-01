import { redirect } from "next/navigation";

import { getSafeReturnPath } from "@/lib/auth/return-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default function AuthenticatedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RequireAuthenticatedUser>{children}</RequireAuthenticatedUser>;
}

async function RequireAuthenticatedUser({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user)
    redirect(
      `/sign-in?next=${encodeURIComponent(getSafeReturnPath("/farms"))}`,
    );
  if (!data.user.email_confirmed_at) redirect("/verify-email");
  return <>{children}</>;
}
