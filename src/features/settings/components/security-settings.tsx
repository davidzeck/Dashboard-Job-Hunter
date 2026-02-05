"use client";

import * as React from "react";
import {
  Shield,
  Key,
  Smartphone,
  Monitor,
  Globe,
  Loader2,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  Label,
  Badge,
} from "@/components/ui";
import {
  useChangePassword,
  useSessions,
  useRevokeSession,
  useRevokeAllSessions,
} from "@/hooks";
import { useSettingsStore, selectSessions, selectCurrentSession, selectOtherSessions, type SettingsState } from "@/stores";
import { formatRelativeTime } from "@/lib/utils";

// Password validation helper
function validatePassword(password: string) {
  const errors: string[] = [];
  if (password.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("One number");
  return errors;
}

export function SecuritySettings() {
  return (
    <div className="space-y-6">
      <PasswordChangeCard />
      <SessionManagementCard />
      <DangerZoneCard />
    </div>
  );
}

function PasswordChangeCard() {
  const changePassword = useChangePassword();

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showValidation, setShowValidation] = React.useState(false);

  const validationErrors = validatePassword(newPassword);
  const passwordsMatch = newPassword === confirmPassword;
  const isValid = validationErrors.length === 0 && passwordsMatch && currentPassword.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);

    if (!isValid) return;

    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setShowValidation(false);
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Key className="h-5 w-5" />
          Change Password
        </CardTitle>
        <CardDescription>
          Update your password to keep your account secure
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
            />
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
            />
            {showValidation && validationErrors.length > 0 && (
              <ul className="text-sm text-destructive space-y-1">
                {validationErrors.map((error) => (
                  <li key={error}>• {error}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
            />
            {showValidation && !passwordsMatch && confirmPassword.length > 0 && (
              <p className="text-sm text-destructive">Passwords do not match</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Button type="submit" disabled={changePassword.isPending}>
            {changePassword.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Changing...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function SessionManagementCard() {
  const { isLoading } = useSessions();
  const sessions = useSettingsStore(selectSessions);
  const currentSession = useSettingsStore(selectCurrentSession);
  const otherSessions = useSettingsStore(selectOtherSessions);
  const revokeSession = useRevokeSession();
  const revokeAllSessions = useRevokeAllSessions();

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes("mobile")) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Active Sessions
        </CardTitle>
        <CardDescription>
          Manage devices where you're currently signed in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Current Session */}
            {currentSession && (
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {getDeviceIcon(currentSession.device)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {currentSession.device} - {currentSession.browser}
                        </p>
                        <Badge variant="success" className="text-xs">
                          Current
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        <span>{currentSession.ip_address}</span>
                        {currentSession.location && (
                          <>
                            <span>•</span>
                            <span>{currentSession.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other Sessions */}
            {otherSessions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Other Active Sessions</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => revokeAllSessions.mutate()}
                    disabled={revokeAllSessions.isPending}
                  >
                    {revokeAllSessions.isPending ? (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-3 w-3" />
                    )}
                    Sign Out All
                  </Button>
                </div>

                {otherSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 rounded-lg border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        {getDeviceIcon(session.device)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {session.device} - {session.browser}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{session.ip_address}</span>
                          <span>•</span>
                          <span>
                            Active {formatRelativeTime(session.last_active)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokeSession.mutate(session.id)}
                      disabled={revokeSession.isPending}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {sessions.length === 0 && !currentSession && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active sessions found
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function DangerZoneCard() {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>
          Irreversible and destructive actions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
          <div>
            <p className="font-medium text-sm">Delete Account</p>
            <p className="text-xs text-muted-foreground">
              Permanently delete your account and all associated data
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Account
          </Button>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog would go here */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-destructive">Delete Account?</CardTitle>
              <CardDescription>
                This action cannot be undone. All your data will be permanently
                deleted.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive">
                Delete My Account
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </Card>
  );
}
