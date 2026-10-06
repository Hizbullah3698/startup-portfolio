"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  /** Speed in pixels per second. */
  speed?: number;
  /** Speed multiplier while hovered (0.4 = 40% speed). */
  hoverSpeed?: number;
  /** Gap between items and between repeated sets, in px. */
  gap?: number;
  /** Fade the left and right edges. */
  fadeEdges?: boolean;
  className?: string;
}

/**
 * Infinite horizontal ticker. The content is rendered twice and shifted by
 * exactly one set width, so the loop is seamless at any speed.
 */
export function Marquee({
  children,
  speed = 45,
  hoverSpeed = 0.4,
  gap = 40,
  fadeEdges = true,
  className,
}: MarqueeProps) {
  const setRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [hovered, setHovered] = useState(false);
  const reduceMotion = useReducedMotion();

  useAnimationFrame((_, delta) => {
    const setWidth = setRef.current?.offsetWidth ?? 0;
    if (!setWidth || reduceMotion) return;
    const distance = (speed * (hovered ? hoverSpeed : 1) * delta) / 1000;
    let next = x.get() - distance;
    if (next <= -(setWidth + gap)) next += setWidth + gap;
    x.set(next);
  });

  const mask = fadeEdges
    ? "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)"
    : undefined;

  return (
    <div
      className={cn("overflow-hidden", className)}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div className="flex w-max" style={{ x, gap }}>
        <div ref={setRef} className="flex shrink-0 items-center" style={{ gap }}>
          {children}
        </div>
        <div aria-hidden className="flex shrink-0 items-center" style={{ gap }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
