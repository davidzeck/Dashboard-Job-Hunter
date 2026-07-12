"use client";

import { useParams } from "next/navigation";
import { DraftEditor } from "@/features/cv-drafts/components/draft-editor";

export default function CVDraftPage() {
  const params = useParams<{ id: string }>();
  return <DraftEditor draftId={params.id} />;
}
