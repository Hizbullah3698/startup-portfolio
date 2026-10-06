import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TagProps {
  children: ReactNode;
  tone?: "dark" | "accent";
}

/** Small outlined pill used for service tags. */
export function Tag({ children, tone = "dark" }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3.5 py-2 text-[13px] font-medium leading-none text-white",
        tone === "dark" ? "border-white/[0.18] bg-white/[0.03]" : "border-white/45 bg-white/[0.08]",
      )}
    >
      {children}
    </span>
  );
}
