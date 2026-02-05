"use client";

import * as React from "react";
import { User, Mail, Save, Loader2 } from "lucide-react";
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
  UserAvatar,
} from "@/components/ui";
import { useAuthStore } from "@/stores";
import { useUpdateProfile } from "@/hooks";

export function ProfileForm() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useUpdateProfile();

  const [fullName, setFullName] = React.useState(user?.full_name || "");
  const [email, setEmail] = React.useState(user?.email || "");
  const [isDirty, setIsDirty] = React.useState(false);

  // Sync with user data
  React.useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setEmail(user.email);
      setIsDirty(false);
    }
  }, [user]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
    setIsDirty(true);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setIsDirty(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updates: { full_name?: string; email?: string } = {};

    if (fullName !== user?.full_name) {
      updates.full_name = fullName;
    }

    if (email !== user?.email) {
      updates.email = email;
    }

    if (Object.keys(updates).length > 0) {
      updateProfile.mutate(updates, {
        onSuccess: () => {
          setIsDirty(false);
        },
      });
    }
  };

  const handleCancel = () => {
    if (user) {
      setFullName(user.full_name);
      setEmail(user.email);
      setIsDirty(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Profile Information</CardTitle>
        <CardDescription>
          Update your account profile details
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <UserAvatar name={user?.full_name || "User"} size="lg" />
            <div>
              <p className="font-medium">{user?.full_name || "User"}</p>
              <p className="text-sm text-muted-foreground">
                {user?.is_admin ? "Administrator" : "User"}
              </p>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={handleNameChange}
                className="pl-10"
                placeholder="Your full name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                className="pl-10"
                placeholder="your@email.com"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Changing your email will require verification
            </p>
          </div>

          {/* Account Created */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Account created:{" "}
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Unknown"}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t pt-4">
          {isDirty && (
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={!isDirty || updateProfile.isPending}>
            {updateProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
