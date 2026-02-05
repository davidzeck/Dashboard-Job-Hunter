"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  MoreVertical,
  Edit2,
  Trash2,
  Power,
  Eye,
  Clock,
  Briefcase,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  Button,
  Badge,
  CompanyAvatar,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import { formatDistanceToNow } from "@/lib/utils";
import type { Company } from "@/types";

interface CompanyCardProps {
  company: Company;
  onEdit?: (company: Company) => void;
  onDelete?: (companyId: string) => void;
  onToggleActive?: (companyId: string, isActive: boolean) => void;
}

export function CompanyCard({
  company,
  onEdit,
  onDelete,
  onToggleActive,
}: CompanyCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/companies/${company.id}`);
  };

  const scraperTypeLabels: Record<string, string> = {
    static: "Static HTML",
    dynamic: "Dynamic JS",
    api: "API",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="hover:shadow-md transition-all cursor-pointer group"
        onClick={handleClick}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <CompanyAvatar
              name={company.name}
              logoUrl={company.logo_url}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {company.name}
                  </h3>
                  <Badge
                    variant={company.is_active ? "success" : "secondary"}
                    className="mt-1"
                  >
                    {company.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => router.push(`/companies/${company.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(company)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {onToggleActive && (
                      <DropdownMenuItem
                        onClick={() => onToggleActive(company.id, !company.is_active)}
                      >
                        <Power className="h-4 w-4 mr-2" />
                        {company.is_active ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(company.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Meta info */}
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {scraperTypeLabels[company.scraper_type] || company.scraper_type}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Every {company.scrape_frequency_hours}h
                </span>
              </div>

              {/* Last scraped */}
              {company.last_scraped_at && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Last scraped {formatDistanceToNow(new Date(company.last_scraped_at))}
                </p>
              )}

              {/* Careers link */}
              <Button
                variant="link"
                size="sm"
                className="mt-2 p-0 h-auto text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(company.careers_url, "_blank");
                }}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Careers Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function CompanyCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 animate-pulse rounded-md bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="h-3 w-40 animate-pulse rounded bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
