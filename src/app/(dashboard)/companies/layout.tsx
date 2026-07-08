import { AdminGuard } from "@/components/shared/admin-guard";

export default function CompaniesLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
