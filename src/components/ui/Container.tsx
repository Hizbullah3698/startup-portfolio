import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  size?: "content" | "narrow";
  className?: string;
}

/** Centres content inside the shared 1100px (or 800px) column. */
export function Container({ children, size = "content", className }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        size === "content" ? "max-w-content" : "max-w-narrow",
        className,
      )}
    >
      {children}
    </div>
  );
}
