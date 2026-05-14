"use client";

import { GoogleAuthButton } from "@/components/auth-button";
import Link from "next/link";
import { motion } from "motion/react";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030303] text-foreground">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <Link href="/" className="mb-8">
            <span className="text-3xl font-bold tracking-tighter uppercase text-white">
              PolyLang
            </span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">
            Welcome back
          </h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue building.
          </p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-8 rounded-2xl shadow-2xl">
          <div className="space-y-6">
            <GoogleAuthButton />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-muted-foreground">
                  Secure access provided by Supabase
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-primary transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="text-sm font-medium text-muted-foreground hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
