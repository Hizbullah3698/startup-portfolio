"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  /** Resting tilt in degrees while the card scrolls in. */
  tilt: number;
  className?: string;
}

/**
 * A card that enters tilted and straightens as it scrolls toward the middle of
 * the viewport. Hovering also straightens it.
 */
export function TiltCard({ children, tilt, className }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 35%"],
  });
  const scrollRotate = useTransform(scrollYProgress, [0, 1], [tilt * 1.6, 0]);
  const rotate = useSpring(scrollRotate, { stiffness: 140, damping: 22 });

  return (
    <motion.div
      ref={ref}
      className={cn("origin-center", className)}
      style={{ rotate: reduceMotion ? tilt : rotate }}
      whileHover={{ rotate: 0, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      {children}
    </motion.div>
  );
}
