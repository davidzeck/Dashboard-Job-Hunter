"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
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

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/overview";

  const login = useAuthStore((state) => state.login);
  const toast = useToast();

  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authService.login({
        email: data.email,
        password: data.password,
      });

      // Store tokens
      storeTokens(response.tokens, data.rememberMe);

      // Update auth store
      login(response.user, response.tokens);

      // Set cookie for middleware
      document.cookie = `jobscout_access_token=${response.tokens.access_token}; path=/; max-age=${data.rememberMe ? 86400 * 30 : 86400}`;

      toast.success("Welcome back!", `Logged in as ${response.user.full_name}`);

      // Redirect to intended destination
      router.push(callbackUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error("Login failed", message);
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
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="rememberMe"
                type="checkbox"
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                {...register("rememberMe")}
              />
              <Label htmlFor="rememberMe" className="text-sm font-normal">
                Remember me for 30 days
              </Label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
              rightIcon={!isSubmitting && <ArrowRight className="h-4 w-4" />}
            >
              Sign in
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

          {/* Sign up link */}
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
