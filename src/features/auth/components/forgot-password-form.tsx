"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth";
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

export function ForgotPasswordForm() {
  const toast = useToast();
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await authService.forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      toast.success("Email sent", "Check your inbox for reset instructions");
    } catch (error) {
      // Even on error, show success for security (don't reveal if email exists)
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
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

            <h2 className="text-xl font-semibold mb-2">Check your email</h2>
            <p className="text-muted-foreground mb-6">
              We sent a password reset link to
              <br />
              <span className="font-medium text-foreground">{submittedEmail}</span>
            </p>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsSubmitted(false)}
              >
                Try another email
              </Button>
              <Link href="/login" className="block">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to sign in
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button
                onClick={() => onSubmit({ email: submittedEmail })}
                className="text-primary hover:underline"
              >
                click to resend
              </button>
            </p>
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
          <CardTitle className="text-2xl">Forgot password?</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you reset instructions
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

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
              rightIcon={!isSubmitting && <ArrowRight className="h-4 w-4" />}
            >
              Send reset link
            </Button>
          </form>

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
