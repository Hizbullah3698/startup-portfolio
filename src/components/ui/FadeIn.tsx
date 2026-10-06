"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { easeOutExpo } from "@/lib/motion";

interface FadeInProps {
  children: ReactNode;
  /** Animate on page load or when scrolled into view. */
  trigger?: "mount" | "inView";
  offsetY?: number;
  scale?: number;
  delay?: number;
  duration?: number;
  className?: string;
}

/** Fades and lifts its children into place. */
export function FadeIn({
  children,
  trigger = "inView",
  offsetY = 30,
  scale = 1,
  delay = 0,
  duration = 0.9,
  className,
}: FadeInProps) {
  const hidden = { opacity: 0, y: offsetY, scale };
  const visible = { opacity: 1, y: 0, scale: 1 };
  const transition = { duration, delay, ease: easeOutExpo };

  return trigger === "mount" ? (
    <motion.div className={className} initial={hidden} animate={visible} transition={transition}>
      {children}
    </motion.div>
  ) : (
    <motion.div
      className={className}
      initial={hidden}
      whileInView={visible}
      viewport={{ once: true, amount: 0.2 }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
