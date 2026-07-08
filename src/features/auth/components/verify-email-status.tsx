"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { authService } from "@/services/auth-service";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";

type Status = "verifying" | "success" | "error";

export function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = React.useState<Status>("verifying");
  const [message, setMessage] = React.useState<string>("");
  const startedRef = React.useRef(false);

  React.useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing its token.");
      return;
    }

    authService
      .verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message);
      })
      .catch((err: unknown) => {
        setStatus("error");
        setMessage(
          err instanceof Error
            ? "This verification link is invalid or has expired."
            : "Verification failed."
        );
      });
  }, [token]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2">
            {status === "verifying" && (
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-10 w-10 text-success" />
            )}
            {status === "error" && <XCircle className="h-10 w-10 text-destructive" />}
          </div>
          <CardTitle>
            {status === "verifying" && "Verifying your email…"}
            {status === "success" && "Email verified"}
            {status === "error" && "Verification failed"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link href={status === "success" ? "/overview" : "/login"}>
            <Button>
              {status === "success" ? "Go to dashboard" : "Back to login"}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
