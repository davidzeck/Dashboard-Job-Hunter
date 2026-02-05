"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores";
import { useCreateCompany, useUpdateCompany, useCreateSource, useUpdateSource, useActiveCompanies } from "@/hooks";
import type { Company, CreateCompanyInput, JobSourceType } from "@/types";

// Base Dialog Components
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

// Modal Provider that connects to Zustand store
export function ModalProvider() {
  const modal = useUIStore((state) => state.modal);
  const closeModal = useUIStore((state) => state.closeModal);

  return (
    <Dialog open={modal.isOpen} onOpenChange={(open) => !open && closeModal()}>
      <AnimatePresence>
        {modal.isOpen && modal.type && (
          <ModalContent type={modal.type} data={modal.data} onClose={closeModal} />
        )}
      </AnimatePresence>
    </Dialog>
  );
}

// Modal content renderer
interface ModalContentProps {
  type: string;
  data: Record<string, unknown> | null;
  onClose: () => void;
}

function ModalContent({ type, data, onClose }: ModalContentProps) {
  // Render different modal content based on type
  switch (type) {
    case "add-source":
      return <AddSourceModal data={data} onClose={onClose} />;
    case "edit-source":
      return <EditSourceModal data={data} onClose={onClose} />;
    case "add-company":
      return <CompanyFormModal onClose={onClose} />;
    case "edit-company":
      return <CompanyFormModal data={data} onClose={onClose} />;
    case "confirm-delete":
      return <ConfirmDeleteModal data={data} onClose={onClose} />;
    default:
      return null;
  }
}

// Add Source Modal
function AddSourceModal({ data, onClose }: { data: Record<string, unknown> | null; onClose: () => void }) {
  const createSource = useCreateSource();
  const { data: companies } = useActiveCompanies();
  const [formData, setFormData] = React.useState({
    company_id: (data?.companyId as string) || "",
    source_type: "careers_page" as JobSourceType,
    source_url: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSource.mutate(formData, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Job Source</DialogTitle>
        <DialogDescription>
          Add a new job source to start tracking opportunities.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Company</label>
          <select
            value={formData.company_id}
            onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          >
            <option value="">Select a company</option>
            {companies?.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Source Type</label>
          <select
            value={formData.source_type}
            onChange={(e) => setFormData({ ...formData, source_type: e.target.value as JobSourceType })}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="careers_page">Careers Page</option>
            <option value="linkedin">LinkedIn</option>
            <option value="indeed">Indeed</option>
            <option value="glassdoor">Glassdoor</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Source URL</label>
          <input
            type="url"
            value={formData.source_url}
            onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
            placeholder="https://company.com/careers"
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          />
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createSource.isPending}
            className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {createSource.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Add Source
          </button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

// Edit Source Modal (placeholder)
function EditSourceModal({ data, onClose }: { data: Record<string, unknown> | null; onClose: () => void }) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Source</DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <p className="text-sm text-muted-foreground">
          Source editing will be implemented here.
        </p>
      </div>
      <DialogFooter>
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-accent">
          Close
        </button>
      </DialogFooter>
    </DialogContent>
  );
}

// Company Form Modal (Add/Edit)
function CompanyFormModal({ data, onClose }: { data?: Record<string, unknown> | null; onClose: () => void }) {
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const existingCompany = data?.company as Company | undefined;
  const isEditing = !!existingCompany;

  const [formData, setFormData] = React.useState<CreateCompanyInput>({
    name: existingCompany?.name || "",
    logo_url: existingCompany?.logo_url || "",
    careers_url: existingCompany?.careers_url || "",
    scraper_type: existingCompany?.scraper_type || "static",
    scrape_frequency_hours: existingCompany?.scrape_frequency_hours || 24,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && existingCompany) {
      updateCompany.mutate(
        { id: existingCompany.id, data: formData },
        { onSuccess: () => onClose() }
      );
    } else {
      createCompany.mutate(formData, { onSuccess: () => onClose() });
    }
  };

  const isPending = createCompany.isPending || updateCompany.isPending;

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Company" : "Add Company"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update the company details below."
            : "Add a new company to monitor for job postings."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Company Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Acme Inc"
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Logo URL</label>
          <input
            type="url"
            value={formData.logo_url || ""}
            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value || undefined })}
            placeholder="https://company.com/logo.png"
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Careers Page URL *</label>
          <input
            type="url"
            value={formData.careers_url}
            onChange={(e) => setFormData({ ...formData, careers_url: e.target.value })}
            placeholder="https://company.com/careers"
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Scraper Type</label>
            <select
              value={formData.scraper_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  scraper_type: e.target.value as "static" | "dynamic" | "api",
                })
              }
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="static">Static HTML</option>
              <option value="dynamic">Dynamic (JS)</option>
              <option value="api">API</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Scrape Frequency</label>
            <select
              value={formData.scrape_frequency_hours}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  scrape_frequency_hours: parseInt(e.target.value),
                })
              }
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value={6}>Every 6 hours</option>
              <option value={12}>Every 12 hours</option>
              <option value={24}>Every 24 hours</option>
              <option value={48}>Every 48 hours</option>
              <option value={168}>Weekly</option>
            </select>
          </div>
        </div>
        <DialogFooter className="pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? "Update Company" : "Add Company"}
          </button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

// Confirm Delete Modal
function ConfirmDeleteModal({
  data,
  onClose,
}: {
  data: Record<string, unknown> | null;
  onClose: () => void;
}) {
  const itemName = (data?.name as string) || "this item";
  const onConfirm = data?.onConfirm as (() => void) | undefined;

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete {itemName}? This action cannot be
          undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-accent"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="px-4 py-2 text-sm font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          Delete
        </button>
      </DialogFooter>
    </DialogContent>
  );
}
