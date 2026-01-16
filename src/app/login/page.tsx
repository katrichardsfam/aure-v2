// src/app/login/page.tsx
"use client";

import { SignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-white flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-cormorant text-4xl font-light tracking-wide text-stone-800">
              aurë
            </span>
          </Link>
          <p className="text-stone-500 mt-3 text-sm">
            Dress your presence.
          </p>
        </div>

        {/* Clerk Sign In */}
        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-white/60 backdrop-blur-sm shadow-none border border-stone-200 rounded-3xl",
                headerTitle: "font-cormorant text-2xl text-stone-800",
                headerSubtitle: "text-stone-500",
                formButtonPrimary: 
                  "bg-stone-800 hover:bg-stone-700 text-white rounded-full",
                formFieldInput: 
                  "rounded-xl border-stone-200 focus:border-stone-400 focus:ring-stone-400",
                footerActionLink: "text-stone-600 hover:text-stone-800",
                dividerLine: "bg-stone-200",
                dividerText: "text-stone-400",
                socialButtonsBlockButton: 
                  "border-stone-200 hover:bg-stone-50 rounded-xl",
                socialButtonsBlockButtonText: "text-stone-700",
              },
            }}
            routing="hash"
            signUpUrl="/login"
            fallbackRedirectUrl="/collection"
            signUpFallbackRedirectUrl="/onboarding"
          />
        </div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute bottom-8 text-stone-400 text-xs"
      >
        Scent is the final layer of getting dressed.
      </motion.p>
    </div>
  );
}
