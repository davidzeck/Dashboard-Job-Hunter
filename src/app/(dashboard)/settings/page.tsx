"use client";

import * as React from "react";
import { User, Bell, Shield, Settings2, Moon, Sun, Monitor } from "lucide-react";
import { PageHeader } from "@/components/layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui";
import { useUIStore, useSettingsStore, selectActiveTab, type SettingsState } from "@/stores";
import {
  ProfileForm,
  NotificationSettings,
  SecuritySettings,
} from "@/features/settings/components";

export default function SettingsPage() {
  const activeTab = useSettingsStore(selectActiveTab);
  const setActiveTab = useSettingsStore((s: SettingsState) => s.setActiveTab);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account and preferences"
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "profile" | "notifications" | "security" | "preferences")
        }
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <ProfileForm />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <SecuritySettings />
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <PreferencesSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PreferencesSection() {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appearance</CardTitle>
          <CardDescription>
            Customize how the dashboard looks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-3 block">Theme</label>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
                className="gap-2"
              >
                <Monitor className="h-4 w-4" />
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Display</CardTitle>
          <CardDescription>
            Configure default display options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Default View</p>
              <p className="text-xs text-muted-foreground">
                Choose between card and table views
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Cards
              </Button>
              <Button variant="ghost" size="sm">
                Table
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Items Per Page</p>
              <p className="text-xs text-muted-foreground">
                Number of items to show in lists
              </p>
            </div>
            <select className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Show Expired Jobs</p>
              <p className="text-xs text-muted-foreground">
                Include expired job listings in search results
              </p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data & Privacy</CardTitle>
          <CardDescription>
            Manage your data and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Export Your Data</p>
              <p className="text-xs text-muted-foreground">
                Download all your data in JSON format
              </p>
            </div>
            <Button variant="outline" size="sm">
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
