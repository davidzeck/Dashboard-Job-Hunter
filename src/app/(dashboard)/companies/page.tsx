"use client";

import * as React from "react";
import { Plus, RefreshCw, LayoutGrid, Table2 } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui";
import {
  CompanyList,
  CompanyTable,
  CompanyFiltersBar,
} from "@/features/companies/components";
import {
  useCompanies,
  useDeleteCompany,
  useToggleCompanyActive,
} from "@/hooks";
import { useCompaniesStore, useUIStore, useToast } from "@/stores";
import type { Company, SortConfig } from "@/types";

type ViewMode = "grid" | "table";

export default function CompaniesPage() {
  const toast = useToast();
  const { isLoading, refetch } = useCompanies();

  // Store state
  const companies = useCompaniesStore((state) => state.companies);
  const pagination = useCompaniesStore((state) => state.pagination);
  const filters = useCompaniesStore((state) => state.filters);
  const sort = useCompaniesStore((state) => state.sort);
  const setFilters = useCompaniesStore((state) => state.setFilters);
  const setSort = useCompaniesStore((state) => state.setSort);
  const setPage = useCompaniesStore((state) => state.setPage);
  const resetFilters = useCompaniesStore((state) => state.resetFilters);
  const openModal = useUIStore((state) => state.openModal);

  // Local state
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");

  // Mutations
  const deleteCompany = useDeleteCompany();
  const toggleActive = useToggleCompanyActive();

  // Handlers
  const handleAddNew = () => {
    openModal("add-company");
  };

  const handleEdit = (company: Company) => {
    openModal("edit-company", { company });
  };

  const handleDelete = (companyId: string) => {
    if (confirm("Are you sure you want to delete this company? This will also delete all associated sources.")) {
      deleteCompany.mutate(companyId);
    }
  };

  const handleToggleActive = (companyId: string, isActive: boolean) => {
    toggleActive.mutate({ id: companyId, isActive });
  };

  const handleSortChange = (newSort: SortConfig) => {
    setSort(newSort);
  };

  // Calculate stats
  const activeCount = companies.filter((c) => c.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Companies"
        description={`${pagination.total} companies | ${activeCount} active`}
        actions={
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center border rounded-lg bg-muted/50 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded ${
                  viewMode === "grid" ? "bg-background shadow-sm" : ""
                }`}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded ${
                  viewMode === "table" ? "bg-background shadow-sm" : ""
                }`}
                title="Table view"
              >
                <Table2 className="h-4 w-4" />
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Button size="sm" onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <CompanyFiltersBar
        filters={filters}
        onFilterChange={setFilters}
        onReset={resetFilters}
      />

      {/* Company List/Table */}
      {viewMode === "table" ? (
        <CompanyTable
          companies={companies}
          isLoading={isLoading}
          pagination={pagination}
          sort={sort}
          onSort={handleSortChange}
          onPageChange={setPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      ) : (
        <CompanyList
          companies={companies}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={setPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          onAddNew={handleAddNew}
        />
      )}
    </div>
  );
}
