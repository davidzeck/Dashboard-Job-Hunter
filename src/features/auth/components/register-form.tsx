"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Check } from "lucide-react";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { useAuthStore, useToast } from "@/stores";
import { authService } from "@/services";
import { storeTokens } from "@/lib/auth";
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

export function RegisterForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const toast = useToast();

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const password = watch("password");

  // Password strength indicators
  const passwordChecks = {
    length: password?.length >= 8,
    lowercase: /[a-z]/.test(password || ""),
    uppercase: /[A-Z]/.test(password || ""),
    number: /[0-9]/.test(password || ""),
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await authService.register({
        email: data.email,
        password: data.password,
        full_name: data.fullName,
      });

      // Store tokens
      storeTokens(response.tokens, true);

      // Update auth store
      login(response.user, response.tokens);

      // Set cookie for middleware
      document.cookie = `jobscout_access_token=${response.tokens.access_token}; path=/; max-age=${86400 * 30}`;

      toast.success("Account created!", "Welcome to Job Scout");

      router.push("/overview");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      toast.error("Registration failed", message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-0 shadow-none lg:shadow-lg lg:border">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Join Job Scout and never miss an opportunity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10"
                  error={!!errors.fullName}
                  {...register("fullName")}
                />
              </div>
              {errors.fullName && (
                <p className="text-sm text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  error={!!errors.email}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
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

              {/* Password strength */}
              {password && (
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <PasswordCheck checked={passwordChecks.length} label="8+ characters" />
                  <PasswordCheck checked={passwordChecks.lowercase} label="Lowercase" />
                  <PasswordCheck checked={passwordChecks.uppercase} label="Uppercase" />
                  <PasswordCheck checked={passwordChecks.number} label="Number" />
                </div>
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
                  placeholder="Confirm your password"
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

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                id="acceptTerms"
                type="checkbox"
                className="h-4 w-4 mt-0.5 rounded border-input text-primary focus:ring-primary"
                {...register("acceptTerms")}
              />
              <Label htmlFor="acceptTerms" className="text-sm font-normal leading-tight">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-destructive">
                {errors.acceptTerms.message}
              </p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
              rightIcon={!isSubmitting && <ArrowRight className="h-4 w-4" />}
            >
              Create account
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          {/* Sign in link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PasswordCheck({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`h-4 w-4 rounded-full flex items-center justify-center ${
          checked ? "bg-success text-white" : "bg-muted"
        }`}
      >
        {checked && <Check className="h-2.5 w-2.5" />}
      </div>
      <span className={checked ? "text-success" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );
}
