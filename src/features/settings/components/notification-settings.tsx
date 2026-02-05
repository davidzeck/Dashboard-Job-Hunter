"use client";

import * as React from "react";
import { Bell, Mail, Smartphone, TestTube, Loader2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Label,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
  useTestNotification,
} from "@/hooks";
import { useSettingsStore, selectNotificationSettings, type SettingsState } from "@/stores";

export function NotificationSettings() {
  const { isLoading } = useNotificationSettings();
  const settings = useSettingsStore(selectNotificationSettings);
  const updateSettings = useUpdateNotificationSettings();
  const testNotification = useTestNotification();

  const handleToggle = (
    key: keyof Pick<
      NonNullable<typeof settings>,
      | "push_enabled"
      | "email_enabled"
      | "alert_on_new_jobs"
      | "alert_on_matching_jobs"
      | "alert_on_scrape_errors"
      | "quiet_hours_enabled"
    >,
    value: boolean
  ) => {
    updateSettings.mutate({ [key]: value });
  };

  const handleEmailFrequencyChange = (value: "instant" | "daily" | "weekly") => {
    updateSettings.mutate({ email_frequency: value });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Channels</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label className="font-medium">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive instant alerts on your device
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => testNotification.mutate("push")}
                disabled={!settings?.push_enabled || testNotification.isPending}
              >
                <TestTube className="h-4 w-4 mr-1" />
                Test
              </Button>
              <Switch
                checked={settings?.push_enabled ?? false}
                onCheckedChange={(checked) =>
                  handleToggle("push_enabled", checked)
                }
              />
            </div>
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label className="font-medium">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts via email
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => testNotification.mutate("email")}
                disabled={!settings?.email_enabled || testNotification.isPending}
              >
                <TestTube className="h-4 w-4 mr-1" />
                Test
              </Button>
              <Switch
                checked={settings?.email_enabled ?? false}
                onCheckedChange={(checked) =>
                  handleToggle("email_enabled", checked)
                }
              />
            </div>
          </div>

          {/* Email Frequency */}
          {settings?.email_enabled && (
            <div className="ml-12 pl-3 border-l-2 border-muted">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Email Frequency</Label>
                  <p className="text-sm text-muted-foreground">
                    How often should we send email digests?
                  </p>
                </div>
                <Select
                  value={settings?.email_frequency || "daily"}
                  onValueChange={handleEmailFrequencyChange}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instant</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alert Types</CardTitle>
          <CardDescription>
            Choose what types of alerts you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* New Jobs */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">New Job Postings</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new jobs are discovered
              </p>
            </div>
            <Switch
              checked={settings?.alert_on_new_jobs ?? true}
              onCheckedChange={(checked) =>
                handleToggle("alert_on_new_jobs", checked)
              }
            />
          </div>

          {/* Matching Jobs */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Matching Jobs Only</Label>
              <p className="text-sm text-muted-foreground">
                Only notify for jobs matching your preferences
              </p>
            </div>
            <Switch
              checked={settings?.alert_on_matching_jobs ?? false}
              onCheckedChange={(checked) =>
                handleToggle("alert_on_matching_jobs", checked)
              }
            />
          </div>

          {/* Scrape Errors */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Scrape Errors</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when a job source fails
              </p>
            </div>
            <Switch
              checked={settings?.alert_on_scrape_errors ?? true}
              onCheckedChange={(checked) =>
                handleToggle("alert_on_scrape_errors", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quiet Hours</CardTitle>
          <CardDescription>
            Pause notifications during certain hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Enable Quiet Hours</Label>
              <p className="text-sm text-muted-foreground">
                No notifications between 10 PM - 8 AM
              </p>
            </div>
            <Switch
              checked={settings?.quiet_hours_enabled ?? false}
              onCheckedChange={(checked) =>
                handleToggle("quiet_hours_enabled", checked)
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
