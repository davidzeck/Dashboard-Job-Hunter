"use client";

import { PageHeader } from "@/components/layout";
import { CVManagement } from "@/features/cvs/components";

export default function CVsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My CVs"
        description="Upload your CV, extract skills, and generate job-tailored versions"
      />
      <CVManagement />
    </div>
  );
}
