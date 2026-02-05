"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useUIStore } from "@/stores";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  headerActions?: React.ReactNode;
}

export function MainLayout({
  children,
  title,
  description,
  headerActions,
}: MainLayoutProps) {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col">
        {/* Header */}
        <Header title={title} description={description} actions={headerActions} />

        {/* Page content */}
        <motion.main
          initial={false}
          animate={{ marginLeft: sidebarCollapsed ? 80 : 240 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex-1 p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}

// Simple page container for content
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={`mx-auto max-w-7xl ${className || ""}`}>{children}</div>
  );
}

// Grid layout for dashboard cards
interface DashboardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export function DashboardGrid({ children, columns = 4 }: DashboardGridProps) {
  const colsClass = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid gap-4 ${colsClass[columns]}`}>{children}</div>
  );
}
