"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/components/ui";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset?: () => void;
}

export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground">
            We encountered an unexpected error. Please try again or contact
            support if the problem persists.
          </p>
        </div>

        {error && process.env.NODE_ENV === "development" && (
          <div className="p-4 bg-muted rounded-lg text-left">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <Bug className="h-4 w-4" />
              <span>Error Details</span>
            </div>
            <pre className="text-xs text-muted-foreground overflow-auto max-h-32">
              {error.message}
            </pre>
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
          <Button onClick={onReset || (() => window.location.reload())}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}

// Page-level error component for route errors
export function PageError({
  title = "Page not found",
  description = "The page you're looking for doesn't exist or has been moved.",
  showHomeButton = true,
}: {
  title?: string;
  description?: string;
  showHomeButton?: boolean;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <span className="text-4xl font-bold text-muted-foreground">404</span>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {showHomeButton && (
          <Button onClick={() => window.location.href = "/"}>
            <Home className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        )}
      </div>
    </div>
  );
}
