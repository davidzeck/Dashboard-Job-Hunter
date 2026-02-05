"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Briefcase,
  Building2,
  Database,
  Settings,
  Plus,
  Play,
  Moon,
  Sun,
  LogOut,
  LayoutDashboard,
  ArrowRight,
  Command,
  Hash,
} from "lucide-react";
import { useUIStore, useAuthStore } from "@/stores";
import { Input } from "@/components/ui";
import { mockJobs, mockCompanies, mockSources } from "@/lib/mock-data";
import type { Job, Company, JobSource } from "@/types";

// Command types
type CommandType = "navigation" | "action" | "job" | "company" | "source" | "setting";

interface CommandItem {
  id: string;
  type: CommandType;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  keywords?: string[];
  action: () => void;
}

// Keyboard shortcut indicator
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border rounded">
      {children}
    </kbd>
  );
}

export function CommandPalette() {
  const router = useRouter();
  const isOpen = useUIStore((state) => state.commandPaletteOpen);
  const setOpen = useUIStore((state) => state.setCommandPaletteOpen);
  const openModal = useUIStore((state) => state.openModal);
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const logout = useAuthStore((state) => state.logout);

  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Close palette
  const close = React.useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, [setOpen]);

  // Navigation commands
  const navigationCommands: CommandItem[] = [
    {
      id: "nav-overview",
      type: "navigation",
      title: "Go to Dashboard",
      subtitle: "View overview and stats",
      icon: <LayoutDashboard className="h-4 w-4" />,
      keywords: ["home", "dashboard", "overview"],
      action: () => {
        router.push("/overview");
        close();
      },
    },
    {
      id: "nav-jobs",
      type: "navigation",
      title: "Go to Jobs",
      subtitle: "View all job listings",
      icon: <Briefcase className="h-4 w-4" />,
      keywords: ["jobs", "positions", "listings"],
      action: () => {
        router.push("/jobs");
        close();
      },
    },
    {
      id: "nav-companies",
      type: "navigation",
      title: "Go to Companies",
      subtitle: "Manage tracked companies",
      icon: <Building2 className="h-4 w-4" />,
      keywords: ["companies", "organizations"],
      action: () => {
        router.push("/companies");
        close();
      },
    },
    {
      id: "nav-sources",
      type: "navigation",
      title: "Go to Sources",
      subtitle: "Manage job sources",
      icon: <Database className="h-4 w-4" />,
      keywords: ["sources", "scrapers", "feeds"],
      action: () => {
        router.push("/sources");
        close();
      },
    },
    {
      id: "nav-settings",
      type: "navigation",
      title: "Go to Settings",
      subtitle: "Configure preferences",
      icon: <Settings className="h-4 w-4" />,
      keywords: ["settings", "preferences", "config"],
      action: () => {
        router.push("/settings");
        close();
      },
    },
  ];

  // Action commands
  const actionCommands: CommandItem[] = [
    {
      id: "action-add-company",
      type: "action",
      title: "Add New Company",
      subtitle: "Track a new company",
      icon: <Plus className="h-4 w-4" />,
      keywords: ["add", "new", "company", "create"],
      action: () => {
        openModal("add-company");
        close();
      },
    },
    {
      id: "action-add-source",
      type: "action",
      title: "Add New Source",
      subtitle: "Add a job source to scrape",
      icon: <Plus className="h-4 w-4" />,
      keywords: ["add", "new", "source", "scraper"],
      action: () => {
        openModal("add-source");
        close();
      },
    },
    {
      id: "action-scrape-all",
      type: "action",
      title: "Trigger All Scrapes",
      subtitle: "Start scraping all active sources",
      icon: <Play className="h-4 w-4" />,
      keywords: ["scrape", "refresh", "update", "fetch"],
      action: () => {
        // This would trigger the scrape all action
        close();
      },
    },
    {
      id: "action-toggle-theme",
      type: "setting",
      title: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
      subtitle: "Toggle color theme",
      icon: theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
      keywords: ["theme", "dark", "light", "mode", "appearance"],
      action: () => {
        setTheme(theme === "dark" ? "light" : "dark");
        close();
      },
    },
    {
      id: "action-logout",
      type: "action",
      title: "Sign Out",
      subtitle: "Log out of your account",
      icon: <LogOut className="h-4 w-4" />,
      keywords: ["logout", "sign out", "exit"],
      action: () => {
        logout();
        router.push("/login");
        close();
      },
    },
  ];

  // Search results from mock data
  const getSearchResults = React.useCallback((searchQuery: string): CommandItem[] => {
    if (!searchQuery || searchQuery.length < 2) return [];

    const lowerQuery = searchQuery.toLowerCase();
    const results: CommandItem[] = [];

    // Search jobs
    const matchingJobs = mockJobs
      .filter(
        (job) =>
          job.title.toLowerCase().includes(lowerQuery) ||
          job.company?.name.toLowerCase().includes(lowerQuery) ||
          job.location?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 5);

    matchingJobs.forEach((job) => {
      results.push({
        id: `job-${job.id}`,
        type: "job",
        title: job.title,
        subtitle: `${job.company?.name || "Unknown"} • ${job.location || "Remote"}`,
        icon: <Briefcase className="h-4 w-4" />,
        action: () => {
          router.push(`/jobs/${job.id}`);
          close();
        },
      });
    });

    // Search companies
    const matchingCompanies = mockCompanies
      .filter((company) => company.name.toLowerCase().includes(lowerQuery))
      .slice(0, 3);

    matchingCompanies.forEach((company) => {
      results.push({
        id: `company-${company.id}`,
        type: "company",
        title: company.name,
        subtitle: company.is_active ? "Active" : "Inactive",
        icon: <Building2 className="h-4 w-4" />,
        action: () => {
          router.push(`/companies/${company.id}`);
          close();
        },
      });
    });

    // Search sources
    const matchingSources = mockSources
      .filter(
        (source) =>
          source.source_url.toLowerCase().includes(lowerQuery) ||
          source.company?.name.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 3);

    matchingSources.forEach((source) => {
      results.push({
        id: `source-${source.id}`,
        type: "source",
        title: source.company?.name || "Unknown Source",
        subtitle: source.source_type,
        icon: <Database className="h-4 w-4" />,
        action: () => {
          router.push(`/sources/${source.id}`);
          close();
        },
      });
    });

    return results;
  }, [router, close]);

  // Filter commands based on query
  const filteredCommands = React.useMemo(() => {
    const allCommands = [...navigationCommands, ...actionCommands];

    if (!query) {
      return allCommands;
    }

    const lowerQuery = query.toLowerCase();

    // Filter static commands
    const filtered = allCommands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(lowerQuery) ||
        cmd.subtitle?.toLowerCase().includes(lowerQuery) ||
        cmd.keywords?.some((k) => k.includes(lowerQuery))
    );

    // Add search results
    const searchResults = getSearchResults(query);

    return [...searchResults, ...filtered];
  }, [query, navigationCommands, actionCommands, getSearchResults]);

  // Keyboard event handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open command palette with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!isOpen);
        return;
      }

      // Only handle other keys when open
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          close();
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setOpen, close, filteredCommands, selectedIndex]);

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset selected index when query changes
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  React.useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector('[data-selected="true"]');
      if (selected) {
        selected.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  // Group commands by type
  const groupedCommands = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      results: [],
      navigation: [],
      actions: [],
    };

    filteredCommands.forEach((cmd) => {
      if (cmd.type === "job" || cmd.type === "company" || cmd.type === "source") {
        groups.results.push(cmd);
      } else if (cmd.type === "navigation") {
        groups.navigation.push(cmd);
      } else {
        groups.actions.push(cmd);
      }
    });

    return groups;
  }, [filteredCommands]);

  // Get icon color based on type
  const getIconColor = (type: CommandType) => {
    switch (type) {
      case "job":
        return "text-blue-500";
      case "company":
        return "text-green-500";
      case "source":
        return "text-purple-500";
      case "navigation":
        return "text-primary";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={close}
          />

          {/* Command palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2"
          >
            <div className="mx-4 overflow-hidden rounded-xl border bg-background shadow-2xl">
              {/* Search input */}
              <div className="flex items-center border-b px-4">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search jobs, companies, or type a command..."
                  className="flex-1 bg-transparent px-4 py-4 text-sm outline-none placeholder:text-muted-foreground"
                />
                <div className="flex items-center gap-1">
                  <Kbd>ESC</Kbd>
                </div>
              </div>

              {/* Results */}
              <div
                ref={listRef}
                className="max-h-80 overflow-y-auto p-2"
              >
                {filteredCommands.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No results found for "{query}"
                  </div>
                ) : (
                  <>
                    {/* Search Results */}
                    {groupedCommands.results.length > 0 && (
                      <div className="mb-2">
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          Search Results
                        </div>
                        {groupedCommands.results.map((cmd) => {
                          const globalIndex = filteredCommands.indexOf(cmd);
                          return (
                            <CommandItemRow
                              key={cmd.id}
                              item={cmd}
                              isSelected={selectedIndex === globalIndex}
                              iconColor={getIconColor(cmd.type)}
                              onClick={cmd.action}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Navigation */}
                    {groupedCommands.navigation.length > 0 && (
                      <div className="mb-2">
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          Navigation
                        </div>
                        {groupedCommands.navigation.map((cmd) => {
                          const globalIndex = filteredCommands.indexOf(cmd);
                          return (
                            <CommandItemRow
                              key={cmd.id}
                              item={cmd}
                              isSelected={selectedIndex === globalIndex}
                              iconColor={getIconColor(cmd.type)}
                              onClick={cmd.action}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Actions */}
                    {groupedCommands.actions.length > 0 && (
                      <div>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          Actions
                        </div>
                        {groupedCommands.actions.map((cmd) => {
                          const globalIndex = filteredCommands.indexOf(cmd);
                          return (
                            <CommandItemRow
                              key={cmd.id}
                              item={cmd}
                              isSelected={selectedIndex === globalIndex}
                              iconColor={getIconColor(cmd.type)}
                              onClick={cmd.action}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                            />
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Kbd>↑</Kbd>
                    <Kbd>↓</Kbd>
                    to navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <Kbd>↵</Kbd>
                    to select
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <Command className="h-3 w-3" />
                  <span>K to toggle</span>
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Command item row component
interface CommandItemRowProps {
  item: CommandItem;
  isSelected: boolean;
  iconColor: string;
  onClick: () => void;
  onMouseEnter: () => void;
}

function CommandItemRow({
  item,
  isSelected,
  iconColor,
  onClick,
  onMouseEnter,
}: CommandItemRowProps) {
  return (
    <button
      data-selected={isSelected}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
        isSelected
          ? "bg-primary/10 text-primary"
          : "hover:bg-muted"
      }`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <div className={`flex-shrink-0 ${iconColor}`}>{item.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{item.title}</div>
        {item.subtitle && (
          <div className="text-xs text-muted-foreground truncate">
            {item.subtitle}
          </div>
        )}
      </div>
      {isSelected && (
        <ArrowRight className="h-4 w-4 flex-shrink-0 text-primary" />
      )}
    </button>
  );
}
