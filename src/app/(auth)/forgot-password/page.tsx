import { ForgotPasswordForm } from "@/features/auth/components";

export const metadata = {
  title: "Forgot Password - Job Scout",
  description: "Reset your Job Scout account password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
