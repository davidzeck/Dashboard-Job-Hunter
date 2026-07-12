/**
 * CV Hooks - Data fetching layer for CV management and skills
 *
 * ARCHITECTURE: API-driven pattern (same as use-settings.ts)
 * - useQuery for reads, useMutation for writes
 * - Mutations invalidate the relevant queries on success
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/stores";
import { cvService } from "@/services/cv-service";
import type {
  CVResponse,
  CVAnalysisResult,
  CVTailorResult,
  CVTaskStatusResponse,
  CVStructure,
} from "@/services/cv-service";

// ============================================
// Query Keys
// ============================================

export const cvKeys = {
  all: ["cv"] as const,
  list: () => [...cvKeys.all, "list"] as const,
  skills: () => [...cvKeys.all, "skills"] as const,
  analysis: (cvId: string, jobId: string) =>
    [...cvKeys.all, "analysis", cvId, jobId] as const,
  tailor: (cvId: string, jobId: string) =>
    [...cvKeys.all, "tailor", cvId, jobId] as const,
  drafts: () => [...cvKeys.all, "drafts"] as const,
  draft: (draftId: string) => [...cvKeys.drafts(), draftId] as const,
  taskStatus: (taskId: string) =>
    [...cvKeys.all, "task", taskId] as const,
  aiUsage: () => [...cvKeys.all, "ai-usage"] as const,
};

/**
 * Daily AI quota snapshot — drives the nearing-limit / limit-reached banner
 * and disables Analyze/Tailor when exhausted.
 */
export function useAiUsage() {
  return useQuery({
    queryKey: cvKeys.aiUsage(),
    queryFn: () => cvService.getAiUsage(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

// ============================================
// CV Hooks
// ============================================

/** Fetch all active CVs for the current user. */
export function useCVs() {
  return useQuery({
    queryKey: cvKeys.list(),
    queryFn: () => cvService.listCVs(),
  });
}

/**
 * Upload a CV via the 3-step presigned POST flow.
 * Pass an optional `onProgress` callback to track S3 upload progress.
 */
export function useUploadCV(onProgress?: (progress: number) => void) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (file: File) => cvService.uploadCV(file, onProgress),
    onSuccess: (cv: CVResponse) => {
      queryClient.invalidateQueries({ queryKey: cvKeys.list() });
      // Also invalidate auth user so has_cv / skills_count refresh on the overview banner
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      toast.success(
        "CV uploaded",
        `"${cv.filename}" is being processed. Skills will appear shortly.`
      );
    },
    onError: (error: Error) => {
      toast.error("Upload failed", error.message);
    },
  });
}

/** Soft-delete a CV. */
export function useDeleteCV() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (cvId: string) => cvService.deleteCV(cvId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cvKeys.list() });
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      toast.success("CV deleted", "The CV has been removed from your account");
    },
    onError: (error: Error) => {
      toast.error("Delete failed", error.message);
    },
  });
}

/** Get a time-limited presigned download URL for a CV. */
export function useGetCVDownloadUrl() {
  const toast = useToast();

  return useMutation({
    mutationFn: (cvId: string) => cvService.getDownloadUrl(cvId),
    onSuccess: (data) => {
      window.open(data.download_url, "_blank");
    },
    onError: (error: Error) => {
      toast.error("Download failed", error.message);
    },
  });
}

// ============================================
// Skills Hooks
// ============================================

/** Fetch all skill names for the current user. */
export function useSkills() {
  return useQuery({
    queryKey: cvKeys.skills(),
    queryFn: () => cvService.getSkills(),
  });
}

/** Add a skill manually. */
export function useAddSkill() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (skill: string) => cvService.addSkill(skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cvKeys.skills() });
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to add skill", error.message);
    },
  });
}

/** Remove a skill by name. */
export function useRemoveSkill() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (skill: string) => cvService.removeSkill(skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cvKeys.skills() });
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to remove skill", error.message);
    },
  });
}

// ============================================
// AI / ATS Hooks
// ============================================

/** Trigger CV analysis against a job. Returns cached result or task_id for polling. */
export function useAnalyzeCv() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ cvId, jobId }: { cvId: string; jobId: string }) =>
      cvService.analyzeCv(cvId, jobId),
    onSettled: () => {
      // Each call consumes daily quota — keep the usage banner current
      queryClient.invalidateQueries({ queryKey: cvKeys.aiUsage() });
    },
    onError: (error: Error) => {
      if (error.message.includes("429") || error.message.includes("limit")) {
        toast.error("AI limit reached", error.message);
      } else {
        toast.error("Analysis failed", error.message);
      }
    },
  });
}

/** Trigger CV tailoring for a job. Always async — poll with useTaskStatus. */
export function useTailorCv() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ cvId, jobId }: { cvId: string; jobId: string }) =>
      cvService.tailorCv(cvId, jobId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cvKeys.aiUsage() });
    },
    onError: (error: Error) => {
      if (error.message.includes("429") || error.message.includes("limit")) {
        toast.error("AI limit reached", error.message);
      } else {
        toast.error("Tailoring failed", error.message);
      }
    },
  });
}

/**
 * Poll a Celery task status. Automatically polls every 2s until terminal state.
 * Pass null to disable polling.
 */
export function useTaskStatus<T = CVAnalysisResult | CVTailorResult>(
  taskId: string | null
) {
  return useQuery({
    queryKey: cvKeys.taskStatus(taskId ?? ""),
    queryFn: () => cvService.getTaskStatus<T>(taskId!),
    enabled: !!taskId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "success" || status === "failure") return false;
      return 2000;
    },
  });
}

// ============================================
// Curated CV Drafts (document export)
// ============================================

/** Start a full-CV curation draft against a job (heaviest AI call — daily cap applies). */
export function useCurateCv() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ cvId, jobId }: { cvId: string; jobId: string }) =>
      cvService.curateCv(cvId, jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cvKeys.drafts() });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cvKeys.aiUsage() });
    },
    onError: (error: Error) => {
      if (error.message.includes("429") || error.message.includes("limit")) {
        toast.error("AI limit reached", error.message);
      } else {
        toast.error("Curation failed to start", error.message);
      }
    },
  });
}

/** All of the caller's drafts (superseded excluded). */
export function useDrafts() {
  return useQuery({
    queryKey: cvKeys.drafts(),
    queryFn: () => cvService.listDrafts(),
  });
}

/**
 * One draft. Polls every 2s while in a transient state (generating → review,
 * approved → rendered); stops on review/rendered/failed/superseded.
 */
export function useDraft(draftId: string | null) {
  return useQuery({
    queryKey: cvKeys.draft(draftId ?? ""),
    queryFn: () => cvService.getDraft(draftId!),
    enabled: !!draftId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "generating" || status === "approved") return 2000;
      return false;
    },
  });
}

/** Save the user's edits to the tailored structure (review stage only). */
export function useUpdateDraft() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ draftId, tailored }: { draftId: string; tailored: CVStructure }) =>
      cvService.updateDraft(draftId, tailored),
    onSuccess: (draft) => {
      queryClient.setQueryData(cvKeys.draft(draft.id), draft);
      toast.success("Draft saved", "Your edits have been saved.");
    },
    onError: (error: Error) => {
      toast.error("Failed to save draft", error.message);
    },
  });
}

/** Approve a reviewed draft — enqueues DOCX+PDF generation. */
export function useApproveDraft() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (draftId: string) => cvService.approveDraft(draftId),
    onSuccess: (_res, draftId) => {
      // Flip the draft query back into polling mode (approved → rendered)
      queryClient.invalidateQueries({ queryKey: cvKeys.draft(draftId) });
      queryClient.invalidateQueries({ queryKey: cvKeys.drafts() });
    },
    onError: (error: Error) => {
      toast.error("Approval failed", error.message);
    },
  });
}

/** Fetch a presigned download URL and open it. */
export function useDraftDownload() {
  const toast = useToast();

  return useMutation({
    mutationFn: ({ draftId, format }: { draftId: string; format: "docx" | "pdf" }) =>
      cvService.getDraftDownloadUrl(draftId, format),
    onSuccess: (download) => {
      window.open(download.download_url, "_blank");
    },
    onError: (error: Error) => {
      toast.error("Download failed", error.message);
    },
  });
}
