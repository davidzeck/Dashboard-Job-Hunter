"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Download,
  FileText,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  PageLoader,
  ErrorState,
} from "@/components/ui";
import {
  useDraft,
  useUpdateDraft,
  useApproveDraft,
  useDraftDownload,
} from "@/hooks";
import type { CVStructure } from "@/services/cv-service";

interface DraftEditorProps {
  draftId: string;
}

/**
 * Status-driven page body for one curation draft:
 * generating → poll · review → editor · approved → poll · rendered → downloads
 */
export function DraftEditor({ draftId }: DraftEditorProps) {
  const router = useRouter();
  const { data: draft, isLoading, isError } = useDraft(draftId);
  const updateMutation = useUpdateDraft();
  const approveMutation = useApproveDraft();
  const downloadMutation = useDraftDownload();

  // Local editable copy of the tailored structure (seeded when review opens)
  const [tailored, setTailored] = React.useState<CVStructure | null>(null);
  React.useEffect(() => {
    if (draft?.status === "review" && draft.content && !tailored) {
      setTailored(draft.content.tailored);
    }
  }, [draft, tailored]);

  if (isLoading) return <PageLoader />;
  if (isError || !draft) {
    return (
      <div className="flex flex-col items-center gap-4">
        <ErrorState
          title="Draft not found"
          description="This draft may have been superseded or removed."
        />
        <Button variant="outline" onClick={() => router.push("/jobs")}>
          Back to jobs
        </Button>
      </div>
    );
  }

  const header = (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Tailored CV draft
          </h1>
          <p className="text-sm text-muted-foreground">
            Review the AI&apos;s work — nothing is final until you approve it.
          </p>
        </div>
      </div>
      <DraftStatusBadge status={draft.status} />
    </div>
  );

  // ── Transient / terminal states ─────────────────────────────────────────
  if (draft.status === "generating") {
    return (
      <div className="space-y-6">
        {header}
        <WaitingCard
          title="Curating your CV…"
          detail="Parsing your CV and tailoring it to this job. Usually under a minute."
        />
      </div>
    );
  }
  if (draft.status === "approved") {
    return (
      <div className="space-y-6">
        {header}
        <WaitingCard
          title="Generating documents…"
          detail="Rendering your approved CV to DOCX and PDF."
        />
      </div>
    );
  }
  if (draft.status === "failed") {
    return (
      <div className="space-y-6">
        {header}
        <div className="flex flex-col items-center gap-4">
          <ErrorState
            title="Curation failed"
            description={draft.error || "Something went wrong. Start a new curation from the job page."}
          />
          <Button variant="outline" onClick={() => router.push(`/jobs/${draft.job_id}`)}>
            Back to job
          </Button>
        </div>
      </div>
    );
  }
  if (draft.status === "superseded") {
    return (
      <div className="space-y-6">
        {header}
        <div className="flex flex-col items-center gap-4">
          <ErrorState
            title="Draft superseded"
            description="A newer curation exists for this CV and job. Check My CVs for your drafts."
          />
          <Button variant="outline" onClick={() => router.push(`/jobs/${draft.job_id}`)}>
            Back to job
          </Button>
        </div>
      </div>
    );
  }
  if (draft.status === "rendered") {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <CheckCircle className="h-10 w-10 text-success" />
            <div>
              <p className="font-semibold">Your tailored CV is ready</p>
              <p className="text-sm text-muted-foreground">
                Download it, give it a final human read, and apply.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                className="gap-2"
                onClick={() => downloadMutation.mutate({ draftId, format: "pdf" })}
                disabled={downloadMutation.isPending || !draft.pdf_ready}
              >
                <Download className="h-4 w-4" /> Download PDF
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => downloadMutation.mutate({ draftId, format: "docx" })}
                disabled={downloadMutation.isPending || !draft.docx_ready}
              >
                <FileText className="h-4 w-4" /> Download DOCX
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Review editor ───────────────────────────────────────────────────────
  const original = draft.content?.original;
  const keywords = draft.content?.keywords_injected ?? [];
  if (!tailored || !original) return <PageLoader />;

  const set = (patch: Partial<CVStructure>) =>
    setTailored((prev) => (prev ? { ...prev, ...patch } : prev));

  return (
    <div className="space-y-6 pb-24">
      {header}

      {keywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <span className="text-xs font-medium mr-1">Keywords worked in:</span>
          {keywords.map((k) => (
            <Badge key={k} variant="secondary" className="text-[10px]">
              {k}
            </Badge>
          ))}
        </div>
      )}

      {/* Contact */}
      <SectionCard title="Contact">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name" value={tailored.contact.name}
            onChange={(v) => set({ contact: { ...tailored.contact, name: v } })} />
          <Field label="Email" value={tailored.contact.email}
            onChange={(v) => set({ contact: { ...tailored.contact, email: v } })} />
          <Field label="Phone" value={tailored.contact.phone}
            onChange={(v) => set({ contact: { ...tailored.contact, phone: v } })} />
          <Field label="Location" value={tailored.contact.location}
            onChange={(v) => set({ contact: { ...tailored.contact, location: v } })} />
        </div>
      </SectionCard>

      {/* Summary — original beside tailored */}
      <SectionCard title="Summary">
        <div className="grid gap-4 lg:grid-cols-2">
          <OriginalBlock text={original.summary || "(no summary in original)"} />
          <div className="space-y-1.5">
            <Label className="text-xs">Tailored</Label>
            <Textarea
              rows={5}
              value={tailored.summary}
              onChange={(e) => set({ summary: e.target.value })}
            />
          </div>
        </div>
      </SectionCard>

      {/* Skills — one comma-separated line per group */}
      <SectionCard title="Skills">
        <div className="space-y-3">
          {tailored.skills.map((group, gi) => (
            <div key={gi} className="grid gap-2 sm:grid-cols-[180px,1fr]">
              <Input
                value={group.category}
                placeholder="Category"
                onChange={(e) => {
                  const skills = [...tailored.skills];
                  skills[gi] = { ...group, category: e.target.value };
                  set({ skills });
                }}
              />
              <Input
                value={group.items.join(", ")}
                placeholder="Comma-separated skills"
                onChange={(e) => {
                  const skills = [...tailored.skills];
                  skills[gi] = {
                    ...group,
                    items: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  };
                  set({ skills });
                }}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Experience — bullets editable line-by-line, original beside */}
      <SectionCard title="Work Experience">
        <div className="space-y-6">
          {tailored.experience.map((exp, ei) => {
            const orig = original.experience[ei];
            return (
              <div key={ei} className="space-y-3 rounded-lg border p-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field label="Title" value={exp.title}
                    onChange={(v) => setExp(ei, { title: v })} />
                  <Field label="Company" value={exp.company}
                    onChange={(v) => setExp(ei, { company: v })} />
                  <Field label="Start" value={exp.start}
                    onChange={(v) => setExp(ei, { start: v })} />
                  <Field label="End" value={exp.end}
                    onChange={(v) => setExp(ei, { end: v })} />
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <OriginalBlock
                    text={orig?.bullets?.length ? orig.bullets.map((b) => `• ${b}`).join("\n") : "(no matching original entry)"}
                  />
                  <div className="space-y-1.5">
                    <Label className="text-xs">Tailored bullets (one per line)</Label>
                    <Textarea
                      rows={Math.max(4, exp.bullets.length + 1)}
                      value={exp.bullets.join("\n")}
                      onChange={(e) =>
                        setExp(ei, {
                          bullets: e.target.value.split("\n").filter((b) => b.trim().length > 0),
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Education + certifications — light-touch editing */}
      <SectionCard title="Education & Certifications">
        <div className="space-y-3">
          {tailored.education.map((edu, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-3">
              <Input value={edu.degree} placeholder="Degree"
                onChange={(e) => setEdu(i, { degree: e.target.value })} />
              <Input value={edu.institution} placeholder="Institution"
                onChange={(e) => setEdu(i, { institution: e.target.value })} />
              <Input value={edu.year} placeholder="Year"
                onChange={(e) => setEdu(i, { year: e.target.value })} />
            </div>
          ))}
          <div className="space-y-1.5">
            <Label className="text-xs">Certifications (one per line)</Label>
            <Textarea
              rows={Math.max(2, tailored.certifications.length + 1)}
              value={tailored.certifications.join("\n")}
              onChange={(e) =>
                set({ certifications: e.target.value.split("\n").filter((c) => c.trim().length > 0) })
              }
            />
          </div>
        </div>
      </SectionCard>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background/95 backdrop-blur px-6 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-end gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => updateMutation.mutate({ draftId, tailored })}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save changes
          </Button>
          <Button
            className="gap-2"
            onClick={async () => {
              // Persist any unsaved edits, then approve
              await updateMutation.mutateAsync({ draftId, tailored });
              approveMutation.mutate(draftId);
            }}
            disabled={approveMutation.isPending || updateMutation.isPending}
          >
            {approveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Approve &amp; generate documents
          </Button>
        </div>
      </div>
    </div>
  );

  // ── local field helpers (close over state setters) ──────────────────────
  function setExp(index: number, patch: Partial<CVStructure["experience"][number]>) {
    setTailored((prev) => {
      if (!prev) return prev;
      const experience = [...prev.experience];
      experience[index] = { ...experience[index], ...patch };
      return { ...prev, experience };
    });
  }
  function setEdu(index: number, patch: Partial<CVStructure["education"][number]>) {
    setTailored((prev) => {
      if (!prev) return prev;
      const education = [...prev.education];
      education[index] = { ...education[index], ...patch };
      return { ...prev, education };
    });
  }
}

// ── Presentational bits ────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function OriginalBlock({ text }: { text: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Original</Label>
      <div className="whitespace-pre-wrap rounded-md border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
        {text}
      </div>
    </div>
  );
}

function WaitingCard({ title, detail }: { title: string; detail: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function DraftStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: "secondary" | "warning" | "success" | "destructive"; label: string }> = {
    generating: { variant: "secondary", label: "Generating" },
    review: { variant: "warning", label: "Awaiting your review" },
    approved: { variant: "secondary", label: "Rendering" },
    rendered: { variant: "success", label: "Ready" },
    failed: { variant: "destructive", label: "Failed" },
    superseded: { variant: "secondary", label: "Superseded" },
  };
  const cfg = map[status] ?? { variant: "secondary" as const, label: status };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
