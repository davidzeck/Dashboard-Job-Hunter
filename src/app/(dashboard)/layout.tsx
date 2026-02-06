"use client";

import { MainLayout } from "@/components/layout";
import { CommandPalette, ErrorBoundary } from "@/components/shared";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
      <CommandPalette />
    </MainLayout>
  );
}
