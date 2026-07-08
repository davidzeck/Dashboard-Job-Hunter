import { AdminGuard } from "@/components/shared/admin-guard";

export default function SourcesLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
