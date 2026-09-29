"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton({ fallbackPath = "/", className = "" }: { fallbackPath?: string; className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={`history-back ${className}`.trim()}
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallbackPath);
      }}
      aria-label="Go back to the previous page"
      title="Go back"
    >
      <ArrowLeft size={16} aria-hidden="true" />
      <span>Back</span>
    </button>
  );
}
