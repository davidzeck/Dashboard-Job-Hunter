"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />

        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"
            animate={{
              x: [0, -30, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold">Job Scout</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold mb-4">
              Speed is your advantage.
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              Get notified instantly when dream jobs are posted. Be the first to
              apply at top companies like Google, Microsoft, Amazon, and more.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-lg font-bold">1</span>
              </div>
              <span className="text-white/90">Real-time job monitoring</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-lg font-bold">2</span>
              </div>
              <span className="text-white/90">Instant push notifications</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-lg font-bold">3</span>
              </div>
              <span className="text-white/90">Apply before the competition</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Job Scout</span>
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
