"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/layout";
import { MyJobsTabs } from "@/features/my-jobs/components/my-jobs-tabs";

export default function MyJobsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Jobs"
        description="Jobs you've saved and applications you're tracking"
      />
      {/* Suspense: MyJobsTabs reads the ?tab= search param */}
      <Suspense fallback={null}>
        <MyJobsTabs />
      </Suspense>
    </div>
  );
}
