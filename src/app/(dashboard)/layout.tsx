"use client";

import { MainLayout } from "@/components/layout";
import { CommandPalette } from "@/components/shared";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      {children}
      <CommandPalette />
    </MainLayout>
  );
}
