"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations/auth";
import { useToast } from "@/stores";
import { authService } from "@/services";
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const toast = useToast();

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // If no token, show error state
  if (!token) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-0 shadow-none lg:shadow-lg lg:border">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>

            <h2 className="text-xl font-semibold mb-2">Invalid reset link</h2>
            <p className="text-muted-foreground mb-6">
              This password reset link is invalid or has expired.
              <br />
              Please request a new one.
            </p>

            <Link href="/forgot-password">
              <Button className="w-full">Request new reset link</Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await authService.resetPassword(token, data.password);
      setIsSuccess(true);
      toast.success("Password reset", "You can now sign in with your new password");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Reset failed";
      toast.error("Reset failed", message);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-0 shadow-none lg:shadow-lg lg:border">
          <CardContent className="pt-8 pb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-6"
            >
              <CheckCircle className="h-8 w-8 text-success" />
            </motion.div>

            <h2 className="text-xl font-semibold mb-2">Password reset!</h2>
            <p className="text-muted-foreground mb-6">
              Your password has been successfully reset.
              <br />
              You can now sign in with your new password.
            </p>

            <Link href="/login">
              <Button className="w-full">
                Continue to sign in
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-0 shadow-none lg:shadow-lg lg:border">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="pl-10 pr-10"
                  error={!!errors.password}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="pl-10 pr-10"
                  error={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
              rightIcon={!isSubmitting && <ArrowRight className="h-4 w-4" />}
            >
              Reset password
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
