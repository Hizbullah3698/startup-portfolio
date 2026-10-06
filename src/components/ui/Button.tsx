import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "accent" | "dark";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Open in a new tab (defaults to true for external links). */
  external?: boolean;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  accent:
    "bg-accent text-white border border-white/15 shadow-[0_12px_40px_rgba(234,0,68,0.45)] hover:bg-accent-hover",
  dark: "bg-background text-white hover:bg-black",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-[18px] py-2.5 text-sm",
  md: "px-[22px] py-[15px] text-[15px]",
  lg: "pl-[26px] pr-[22px] py-4 text-base",
};

/** Pill-shaped link button with a springy hover lift. */
export function Button({
  href,
  children,
  variant = "accent",
  size = "md",
  external,
  className,
}: ButtonProps) {
  const isExternal = external ?? /^https?:\/\//.test(href);

  return (
    <a
      href={href}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "inline-flex items-center justify-center gap-2.5 rounded-full font-semibold leading-none",
        "transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        "hover:-translate-y-0.5 hover:scale-105 active:scale-[0.97]",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </a>
  );
}
