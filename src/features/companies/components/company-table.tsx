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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
  CompanyAvatar,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Pagination,
} from "@/components/ui";
import { formatDistanceToNow } from "@/lib/utils";
import type { Company, SortConfig } from "@/types";

interface CompanyTableProps {
  companies: Company[];
  isLoading: boolean;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  sort: SortConfig;
  onSort: (sort: SortConfig) => void;
  onPageChange: (page: number) => void;
  onEdit?: (company: Company) => void;
  onDelete?: (companyId: string) => void;
  onToggleActive?: (companyId: string, isActive: boolean) => void;
}

const scraperTypeLabels: Record<string, string> = {
  static: "Static",
  dynamic: "Dynamic",
  api: "API",
};

export function CompanyTable({
  companies,
  isLoading,
  pagination,
  sort,
  onSort,
  onPageChange,
  onEdit,
  onDelete,
  onToggleActive,
}: CompanyTableProps) {
  const router = useRouter();

  const handleSort = (field: string) => {
    if (sort.field === field) {
      onSort({
        field,
        direction: sort.direction === "asc" ? "desc" : "asc",
      });
    } else {
      onSort({ field, direction: "asc" });
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sort.field !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 text-muted-foreground" />;
    }
    return sort.direction === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  const handleRowClick = (companyId: string) => {
    router.push(`/companies/${companyId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scraper</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Last Scraped</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">
                <button
                  className="flex items-center font-medium hover:text-primary"
                  onClick={() => handleSort("name")}
                >
                  Company
                  <SortIcon field="name" />
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scraper</TableHead>
              <TableHead>
                <button
                  className="flex items-center font-medium hover:text-primary"
                  onClick={() => handleSort("scrape_frequency_hours")}
                >
                  Frequency
                  <SortIcon field="scrape_frequency_hours" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center font-medium hover:text-primary"
                  onClick={() => handleSort("last_scraped_at")}
                >
                  Last Scraped
                  <SortIcon field="last_scraped_at" />
                </button>
              </TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow
                key={company.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(company.id)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <CompanyAvatar
                      name={company.name}
                      logoUrl={company.logo_url}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium">{company.name}</p>
                      <a
                        href={company.careers_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Careers
                      </a>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={company.is_active ? "success" : "secondary"}>
                    {company.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {scraperTypeLabels[company.scraper_type] || company.scraper_type}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  Every {company.scrape_frequency_hours}h
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {company.last_scraped_at
                    ? formatDistanceToNow(new Date(company.last_scraped_at))
                    : "Never"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
