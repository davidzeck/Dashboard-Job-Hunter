import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components";
import { Spinner } from "@/components/ui";

export const metadata = {
  title: "Reset Password - Job Scout",
  description: "Set a new password for your Job Scout account",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Spinner size="lg" className="mx-auto" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
