"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  CheckCircle,
  XCircle,
  Lightbulb,
  Wand2,
  Copy,
  Loader2,
  FileText,
  FileOutput,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import {
  useCVs,
  useAnalyzeCv,
  useTailorCv,
  useTaskStatus,
  useAiUsage,
  useCurateCv,
} from "@/hooks";
import { AiUsageBanner } from "@/components/shared";
import type {
  CVResponse,
  CVAnalysisResult,
  CVTailorResult,
} from "@/services/cv-service";
import { useToast } from "@/stores";

interface CVMatchCardProps {
  jobId: string;
}

export function CVMatchCard({ jobId }: CVMatchCardProps) {
  const toast = useToast();
  const router = useRouter();
  const { data: cvs, isLoading: cvsLoading } = useCVs();
  const { data: aiUsage } = useAiUsage();
  const analyzeMutation = useAnalyzeCv();
  const tailorMutation = useTailorCv();
  const curateMutation = useCurateCv();
  const aiBlocked = aiUsage?.exhausted ?? false;

  // State
  const [selectedCvId, setSelectedCvId] = React.useState<string | null>(null);
  const [analysisResult, setAnalysisResult] =
    React.useState<CVAnalysisResult | null>(null);
  const [tailorResult, setTailorResult] =
    React.useState<CVTailorResult | null>(null);
  const [analyzeTaskId, setAnalyzeTaskId] = React.useState<string | null>(null);
  const [tailorTaskId, setTailorTaskId] = React.useState<string | null>(null);

  // Polling for analysis task
  const { data: analyzeTaskData } =
    useTaskStatus<CVAnalysisResult>(analyzeTaskId);
  const { data: tailorTaskData } =
    useTaskStatus<CVTailorResult>(tailorTaskId);

  // Auto-select first ready CV
  const readyCvs = React.useMemo(
    () => (cvs ?? []).filter((cv) => cv.upload_status === "ready"),
    [cvs]
  );

  React.useEffect(() => {
    if (!selectedCvId && readyCvs.length > 0) {
      setSelectedCvId(readyCvs[0].id);
    }
  }, [readyCvs, selectedCvId]);

  // Handle analysis task completion
  React.useEffect(() => {
    if (analyzeTaskData?.status === "success" && analyzeTaskData.result) {
      setAnalysisResult(analyzeTaskData.result as CVAnalysisResult);
      setAnalyzeTaskId(null);
    } else if (analyzeTaskData?.status === "failure") {
      toast.error("Analysis failed", analyzeTaskData.error || "Unknown error");
      setAnalyzeTaskId(null);
    }
  }, [analyzeTaskData, toast]);

  // Handle tailor task completion
  React.useEffect(() => {
    if (tailorTaskData?.status === "success" && tailorTaskData.result) {
      setTailorResult(tailorTaskData.result as CVTailorResult);
      setTailorTaskId(null);
    } else if (tailorTaskData?.status === "failure") {
      toast.error("Tailoring failed", tailorTaskData.error || "Unknown error");
      setTailorTaskId(null);
    }
  }, [tailorTaskData, toast]);

  const handleAnalyze = async () => {
    if (!selectedCvId) return;
    setAnalysisResult(null);
    setTailorResult(null);

    const res = await analyzeMutation.mutateAsync({
      cvId: selectedCvId,
      jobId,
    });

    if (res.status === "success" && res.result) {
      setAnalysisResult(res.result as CVAnalysisResult);
    } else if (res.status === "pending" || res.status === "started") {
      setAnalyzeTaskId(res.task_id);
    }
  };

  const handleTailor = async () => {
    if (!selectedCvId) return;
    setTailorResult(null);

    const res = await tailorMutation.mutateAsync({
      cvId: selectedCvId,
      jobId,
    });

    if (res.status === "success" && res.result) {
      setTailorResult(res.result as CVTailorResult);
    } else if (res.status === "pending" || res.status === "started") {
      setTailorTaskId(res.task_id);
    }
  };

  const handleCopySummary = () => {
    if (tailorResult?.tailored_summary) {
      navigator.clipboard.writeText(tailorResult.tailored_summary);
      toast.success("Copied", "Tailored summary copied to clipboard");
    }
  };

  const handleCurate = async () => {
    if (!selectedCvId) return;
    // Draft page owns the rest of the flow (poll → review → approve → download)
    const res = await curateMutation.mutateAsync({ cvId: selectedCvId, jobId });
    router.push(`/cv-drafts/${res.draft_id}`);
  };

  const isAnalyzing =
    analyzeMutation.isPending || !!analyzeTaskId;
  const isTailoring =
    tailorMutation.isPending || !!tailorTaskId;

  // Loading state
  if (cvsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            CV Match
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // No CVs
  if (readyCvs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            CV Match
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <FileText className="h-5 w-5 shrink-0 mt-0.5" />
            <p>
              Upload a CV in{" "}
              <a href="/settings" className="text-primary underline">
                Settings
              </a>{" "}
              to enable AI-powered match analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const matchScore = analysisResult
    ? Math.round(analysisResult.match_score * 100)
    : null;
  const scoreColor =
    matchScore !== null
      ? matchScore >= 75
        ? "text-success"
        : matchScore >= 50
          ? "text-warning"
          : "text-destructive"
      : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          CV Match
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* CV selector */}
        {readyCvs.length > 1 && (
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={selectedCvId ?? ""}
            onChange={(e) => {
              setSelectedCvId(e.target.value);
              setAnalysisResult(null);
              setTailorResult(null);
            }}
          >
            {readyCvs.map((cv) => (
              <option key={cv.id} value={cv.id}>
                {cv.filename}
              </option>
            ))}
          </select>
        )}

        {/* Daily AI quota: warn when nearing, block when exhausted */}
        <AiUsageBanner usage={aiUsage} />

        {/* Analyze button (before results) */}
        {!analysisResult && (
          <Button
            className="w-full gap-2"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !selectedCvId || aiBlocked}
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isAnalyzing ? "Analyzing..." : "Analyze Match"}
          </Button>
        )}

        {/* Analysis result */}
        {analysisResult && (
          <div className="space-y-4">
            {/* Match score */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Match Score</span>
              <span className={cn("text-2xl font-bold", scoreColor)}>
                {matchScore}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  matchScore! >= 75
                    ? "bg-success"
                    : matchScore! >= 50
                      ? "bg-warning"
                      : "bg-destructive"
                )}
                style={{ width: `${matchScore}%` }}
              />
            </div>

            {/* Present keywords */}
            {analysisResult.present_keywords.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2 text-sm font-medium text-success">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Present Keywords
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.present_keywords.map((kw) => (
                    <Badge
                      key={kw}
                      variant="outline"
                      className="border-success/30 bg-success/5 text-success text-xs"
                    >
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Missing keywords */}
            {analysisResult.missing_keywords.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2 text-sm font-medium text-destructive">
                  <XCircle className="h-3.5 w-3.5" />
                  Missing Keywords
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.missing_keywords.map((kw) => (
                    <Badge
                      key={kw}
                      variant="outline"
                      className="border-destructive/30 bg-destructive/5 text-destructive text-xs"
                    >
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {analysisResult.suggested_additions.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2 text-sm font-medium text-warning">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Suggestions
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {analysisResult.suggested_additions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-warning mt-0.5">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tailor section */}
            {tailorResult ? (
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tailored Summary</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopySummary}
                    className="gap-1.5 h-7"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                </div>
                <div className="rounded-md border border-success/20 bg-success/5 p-3 text-xs leading-relaxed">
                  {tailorResult.tailored_summary}
                </div>
                {tailorResult.keywords_added.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-success">
                      Keywords added:{" "}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {tailorResult.keywords_added.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleTailor}
                disabled={isTailoring || aiBlocked}
              >
                {isTailoring ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                {isTailoring ? "Tailoring..." : "Tailor CV for This Job"}
              </Button>
            )}

            {/* Curate full CV → downloadable ATS document (review flow) */}
            <Button
              className="w-full gap-2"
              onClick={handleCurate}
              disabled={curateMutation.isPending || aiBlocked}
            >
              {curateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileOutput className="h-4 w-4" />
              )}
              {curateMutation.isPending
                ? "Starting curation..."
                : "Curate Full CV (PDF/Word)"}
            </Button>

            {/* Re-analyze */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={handleAnalyze}
              disabled={isAnalyzing || aiBlocked}
            >
              {isAnalyzing ? "Analyzing..." : "Re-analyze"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
