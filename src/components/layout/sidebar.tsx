"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  Bell,
  Building2,
  Database,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore, selectIsAdmin, useUIStore } from "@/stores";
import { useUserStats } from "@/hooks";
import { Button } from "@/components/ui";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  /** Shows the unread-alerts count pill when set */
  alertBadge?: boolean;
}

// Client-facing navigation — every authenticated user
const clientNavItems: NavItem[] = [
  { label: "Overview", href: "/overview", icon: LayoutDashboard },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "My Jobs", href: "/my-jobs", icon: Bookmark },
  { label: "Alerts", href: "/alerts", icon: Bell, alertBadge: true },
  { label: "My CVs", href: "/cvs", icon: FileText },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Settings", href: "/settings", icon: Settings },
];

// Admin section — platform management
const adminNavItems: NavItem[] = [
  { label: "Sources", href: "/sources", icon: Database },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebarCollapse = useUIStore((state) => state.toggleSidebarCollapse);
  const isAdmin = useAuthStore(selectIsAdmin);
  const { data: stats } = useUserStats();
  const unread = stats?.unread_alerts ?? 0;

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="fixed left-0 top-0 z-40 h-screen border-r bg-card"
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/overview" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-semibold text-lg overflow-hidden whitespace-nowrap"
                >
                  Job Scout
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {clientNavItems.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              isActive={pathname.startsWith(item.href)}
              collapsed={sidebarCollapsed}
              badgeCount={item.alertBadge ? unread : 0}
            />
          ))}

          {isAdmin && (
            <>
              <div className="pt-4 pb-1">
                {!sidebarCollapsed ? (
                  <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Admin
                  </p>
                ) : (
                  <div className="mx-3 border-t" />
                )}
              </div>
              {adminNavItems.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  isActive={pathname.startsWith(item.href)}
                  collapsed={sidebarCollapsed}
                  badgeCount={0}
                />
              ))}
            </>
          )}
        </nav>

        {/* Collapse toggle */}
        <CollapseToggle
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebarCollapse}
        />
      </div>
    </motion.aside>
  );
}

function SidebarLink({
  item,
  isActive,
  collapsed,
  badgeCount,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  badgeCount: number;
}) {
  const Icon = item.icon;
  return (
    <Link href={item.href}>
      <motion.div
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <span className="relative shrink-0">
          <Icon className="h-5 w-5" />
          {badgeCount > 0 && collapsed && (
            <span className="absolute -top-1.5 -right-1.5 h-2 w-2 rounded-full bg-urgent" />
          )}
        </span>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap flex-1"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
        {badgeCount > 0 && !collapsed && (
          <span
            className={cn(
              "ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
              isActive
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-urgent text-urgent-foreground"
            )}
          >
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </motion.div>
    </Link>
  );
}

function CollapseToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-t p-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="w-full justify-center"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
