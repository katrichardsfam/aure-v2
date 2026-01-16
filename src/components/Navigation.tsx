// src/components/Navigation.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/collection", label: "Vault", icon: Home },
  { href: "/ritual", label: "Fit Check", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-stone-200 px-6 py-3 z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors",
                isActive 
                  ? "text-stone-800" 
                  : "text-stone-400 hover:text-stone-600"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
