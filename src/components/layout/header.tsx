"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Bell, Search, Moon, Sun, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore, useAuthStore } from "@/stores";
import { Button, UserAvatar, SearchInput } from "@/components/ui";

interface HeaderProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Header({ title, description, actions }: HeaderProps) {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <motion.header
      initial={false}
      animate={{ marginLeft: sidebarCollapsed ? 80 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side - Title */}
        <div className="flex flex-col">
          {title && (
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:block w-64">
            <SearchInput
              placeholder="Search jobs, companies..."
              className="h-9"
            />
          </div>

          {/* Custom actions */}
          {actions}

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-urgent text-[10px] font-medium text-urgent-foreground flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User menu */}
          <div className="flex items-center gap-3 border-l pl-4">
            {user && (
              <>
                <UserAvatar name={user.full_name} size="sm" />
                <div className="hidden lg:block">
                  <p className="text-sm font-medium">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="h-9 w-9"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

// Page header for section pages
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-2 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <span key={index}>
              {index > 0 && <span className="mx-2">/</span>}
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-foreground">
                  {crumb.label}
                </a>
              ) : (
                <span className="text-foreground">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Title and actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="mt-1 text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
