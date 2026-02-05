"use client";

import * as React from "react";
import { Plus, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button, EmptyState, Pagination } from "@/components/ui";
import { CompanyCard, CompanyCardSkeleton } from "./company-card";
import type { Company } from "@/types";

interface CompanyListProps {
  companies: Company[];
  isLoading: boolean;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onEdit?: (company: Company) => void;
  onDelete?: (companyId: string) => void;
  onToggleActive?: (companyId: string, isActive: boolean) => void;
  onAddNew?: () => void;
}

export function CompanyList({
  companies,
  isLoading,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  onToggleActive,
  onAddNew,
}: CompanyListProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CompanyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No companies found"
        description="Add your first company to start tracking their job postings."
        action={
          onAddNew ? (
            <Button onClick={onAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
          },
        }}
      >
        {companies.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
          />
        ))}
      </motion.div>

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
