// src/app/page.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100 flex flex-col">
      {/* Main content - centered */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-md"
        >
          {/* Wordmark */}
          <h1 className="font-cormorant font-light text-5xl md:text-6xl tracking-wide text-stone-900 mb-6">
            aurë
          </h1>
          
          {/* Tagline */}
          <p className="font-inter text-lg text-stone-600 mb-12 leading-relaxed">
            Scent is the final layer of getting dressed.
          </p>
          
          {/* Primary CTA */}
          <Link href="/collection">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-stone-800 text-white font-inter text-base px-10 py-4 rounded-full hover:bg-stone-900 transition-colors duration-200 mb-4"
            >
              Start styling your scent
            </motion.button>
          </Link>
          
          {/* Secondary action */}
          <Link href="/collection">
            <span className="font-inter text-sm text-stone-500 hover:text-stone-700 transition-colors">
              Explore without signing up
            </span>
          </Link>
        </motion.div>
      </main>
      
      {/* Footer tagline */}
      <footer className="pb-8 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="font-cormorant font-light text-stone-400 italic"
        >
          Dress your presence.
        </motion.p>
      </footer>
    </div>
  );
}
