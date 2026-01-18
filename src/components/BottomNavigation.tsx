"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

const navItems = [
  { href: "/collection", label: "Vault" },
  { href: "/vibes", label: "Vibes" },
  { href: "/ritual", label: "Ritual", isCenter: true },
  { href: "/log", label: "Log" },
  { href: "/profile", label: "Aura" },
];

export function BottomNavigation() {
  const pathname = usePathname();

  const hiddenPaths = ["/", "/login", "/aura"];
  if (hiddenPaths.some((path) => pathname === path || pathname.startsWith("/aura"))) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-stone-200"
    >
      <div className="flex items-center justify-around max-w-md mx-auto px-2 py-2 pb-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          if (item.isCenter) {
            return (
              <Link key={item.href} href={item.href} className="relative -mt-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
                    isActive
                      ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white"
                      : "bg-gradient-to-br from-amber-500 to-amber-600 text-white"
                  }`}
                >
                  <span className="text-lg">✨</span>
                </motion.div>
                <span className="block text-center text-[10px] font-medium mt-1 text-amber-700">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center py-2 px-4"
            >
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`text-lg ${isActive ? "text-amber-600" : "text-stone-400"}`}
              >
                {item.label === "Vault" && "📦"}
                {item.label === "Vibes" && "🌟"}
                {item.label === "Log" && "📝"}
                {item.label === "Aura" && "👤"}
              </motion.div>
              <span
                className={`text-[10px] font-medium mt-1 ${
                  isActive ? "text-amber-600" : "text-stone-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
