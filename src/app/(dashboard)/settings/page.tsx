"use client";

import * as React from "react";
import { Moon, Sun, Monitor, Bell, Shield, User } from "lucide-react";
import { PageHeader } from "@/components/layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
} from "@/components/ui";
import { useUIStore, useAuthStore } from "@/stores";

export default function SettingsPage() {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your dashboard preferences"
      />

      <div className="grid gap-6 md:grid-cols-2">
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
              <label className="text-sm font-medium mb-2 block">Theme</label>
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  leftIcon={<Sun className="h-4 w-4" />}
                >
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  leftIcon={<Moon className="h-4 w-4" />}
                >
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                  leftIcon={<Monitor className="h-4 w-4" />}
                >
                  System
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium">{user?.full_name || "User"}</p>
                <p className="text-sm text-muted-foreground">
                  {user?.email || "email@example.com"}
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notifications</CardTitle>
            <CardDescription>
              Configure how you receive alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    Receive alerts on your device
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input"
                defaultChecked
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    Receive alerts via email
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input"
                defaultChecked
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Security</CardTitle>
            <CardDescription>
              Manage your security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              <Shield className="h-4 w-4 mr-2" />
              Change Password
            </Button>
            <Button variant="outline" className="w-full text-destructive">
              Sign Out of All Devices
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
