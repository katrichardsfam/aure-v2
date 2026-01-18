"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect /search to /collection/add
export default function SearchRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/collection/add");
  }, [router]);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
    </div>
  );
}
