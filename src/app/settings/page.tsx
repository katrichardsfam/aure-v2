// src/app/settings/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { ArrowLeft, LogOut, MapPin, Droplets, Bell, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [useWeather, setUseWeather] = useState(true);

  // TODO: Fetch and update user preferences from Convex

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-white">
      {/* Header */}
      <header className="px-6 py-6 flex items-center gap-4 border-b border-stone-200/50">
        <button
          onClick={() => router.push("/collection")}
          className="p-2 -ml-2 text-stone-600 hover:text-stone-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-cormorant text-2xl text-stone-800">Settings</h1>
      </header>

      <main className="px-6 py-8 max-w-lg mx-auto">
        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="p-6 bg-white/60 backdrop-blur-sm rounded-3xl border border-stone-200">
            <div className="flex items-center gap-4">
              {user?.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt=""
                  className="w-14 h-14 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-cormorant text-xl text-stone-800">
                  {user?.firstName || "Welcome"}
                </p>
                <p className="text-stone-500 text-sm">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Preferences Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-stone-500 text-xs uppercase tracking-widest mb-4 px-2">
            Preferences
          </h2>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-stone-200 overflow-hidden">
            {/* Weather Context Toggle */}
            <button
              onClick={() => setUseWeather(!useWeather)}
              className="w-full p-4 flex items-center justify-between hover:bg-stone-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-stone-600" />
                </div>
                <div className="text-left">
                  <p className="text-stone-800 font-medium">Weather context</p>
                  <p className="text-stone-500 text-sm">Auto-detect local weather</p>
                </div>
              </div>
              <div className={cn(
                "w-12 h-7 rounded-full transition-colors relative",
                useWeather ? "bg-stone-800" : "bg-stone-300"
              )}>
                <div className={cn(
                  "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform",
                  useWeather ? "translate-x-6" : "translate-x-1"
                )} />
              </div>
            </button>

            <div className="h-px bg-stone-200" />

            {/* Default Location */}
            <button
              onClick={() => {
                // TODO: Open location picker
              }}
              className="w-full p-4 flex items-center justify-between hover:bg-stone-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-stone-600" />
                </div>
                <div className="text-left">
                  <p className="text-stone-800 font-medium">Default location</p>
                  <p className="text-stone-500 text-sm">Not set</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-400" />
            </button>

            <div className="h-px bg-stone-200" />

            {/* Notifications */}
            <button
              onClick={() => {
                // TODO: Notification settings
              }}
              className="w-full p-4 flex items-center justify-between hover:bg-stone-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-stone-600" />
                </div>
                <div className="text-left">
                  <p className="text-stone-800 font-medium">Daily reminder</p>
                  <p className="text-stone-500 text-sm">Off</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-400" />
            </button>
          </div>
        </motion.div>

        {/* Scent Preferences Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-stone-500 text-xs uppercase tracking-widest mb-4 px-2">
            Scent Preferences
          </h2>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-stone-200 overflow-hidden">
            <Link
              href="/onboarding"
              className="w-full p-4 flex items-center justify-between hover:bg-stone-50/50 transition-colors"
            >
              <div className="text-left">
                <p className="text-stone-800 font-medium">Favorite scent families</p>
                <p className="text-stone-500 text-sm">Update your preferences</p>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-400" />
            </Link>

            <div className="h-px bg-stone-200" />

            <button
              onClick={() => {
                // TODO: Notes to avoid
              }}
              className="w-full p-4 flex items-center justify-between hover:bg-stone-50/50 transition-colors"
            >
              <div className="text-left">
                <p className="text-stone-800 font-medium">Notes to avoid</p>
                <p className="text-stone-500 text-sm">None set</p>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-400" />
            </button>
          </div>
        </motion.div>

        {/* Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-stone-500 text-xs uppercase tracking-widest mb-4 px-2">
            Account
          </h2>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-stone-200 overflow-hidden">
            <button
              onClick={handleSignOut}
              className="w-full p-4 flex items-center gap-3 hover:bg-stone-50/50 transition-colors text-rose-600"
            >
              <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-medium">Sign out</span>
            </button>
          </div>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="font-cormorant text-xl text-stone-400">aurë</p>
          <p className="text-stone-400 text-xs mt-1">Version 2.0</p>
        </motion.div>
      </main>
    </div>
  );
}
