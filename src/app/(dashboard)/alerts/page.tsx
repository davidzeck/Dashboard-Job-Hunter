"use client";

import { PageHeader } from "@/components/layout";
import { AlertsList } from "@/features/alerts/components/alerts-list";

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        description="New jobs matched to your skills and preferences"
      />
      <AlertsList />
    </div>
  );
}
