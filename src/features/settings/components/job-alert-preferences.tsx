"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { X, Plus } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  Badge,
} from "@/components/ui";
import { settingsService } from "@/services";
import { useAuthStore, selectUser, useToast } from "@/stores";

function readList(prefs: Record<string, unknown> | undefined, key: string): string[] {
  const value = prefs?.[key];
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

/**
 * Job Alert Preferences — the filters the alert matcher uses:
 * role keywords, locations, and a company watchlist.
 * Persists via PUT /users/me/preferences (merged server-side).
 */
export function JobAlertPreferences() {
  const user = useAuthStore(selectUser);
  const updateUser = useAuthStore((state) => state.updateUser);
  const toast = useToast();

  const [roles, setRoles] = React.useState<string[]>(() =>
    readList(user?.preferences, "roles")
  );
  const [locations, setLocations] = React.useState<string[]>(() =>
    readList(user?.preferences, "locations")
  );
  const [companies, setCompanies] = React.useState<string[]>(() =>
    readList(user?.preferences, "companies")
  );

  const save = useMutation({
    mutationFn: () =>
      settingsService.updateJobPreferences({ roles, locations, companies }),
    onSuccess: () => {
      updateUser({
        preferences: { ...user?.preferences, roles, locations, companies },
      });
      toast.success("Preferences saved", "Job alerts will use your new filters");
    },
    onError: (error: Error) => {
      toast.error("Failed to save preferences", error.message);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Job Alert Preferences</CardTitle>
        <CardDescription>
          Tune which new jobs trigger alerts: role keywords, locations, and
          companies you want to watch. Skill-based matching from your CV applies
          automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <ChipListInput
          label="Role keywords"
          placeholder="e.g. backend, react, data engineer"
          values={roles}
          onChange={setRoles}
        />
        <ChipListInput
          label="Locations"
          placeholder="e.g. Nairobi, Remote"
          values={locations}
          onChange={setLocations}
        />
        <ChipListInput
          label="Company watchlist"
          placeholder="e.g. Safaricom"
          values={companies}
          onChange={setCompanies}
        />
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save preferences"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function ChipListInput({
  label,
  placeholder,
  values,
  onChange,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [draft, setDraft] = React.useState("");

  const add = () => {
    const value = draft.trim();
    if (!value) return;
    if (!values.some((v) => v.toLowerCase() === value.toLowerCase())) {
      onChange([...values, value]);
    }
    setDraft("");
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" size="icon" onClick={add}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((value) => (
            <Badge key={value} variant="secondary" className="gap-1 pr-1">
              {value}
              <button
                type="button"
                onClick={() => onChange(values.filter((v) => v !== value))}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                aria-label={`Remove ${value}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
