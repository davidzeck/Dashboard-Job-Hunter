import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components";
import { Spinner } from "@/components/ui";

export const metadata = {
  title: "Sign In - Job Scout",
  description: "Sign in to your Job Scout account",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<Spinner size="lg" className="mx-auto" />}>
      <LoginForm />
    </Suspense>
  );
}
