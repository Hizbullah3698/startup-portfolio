import type { Transition } from "motion/react";

/** Shared easing curves and transitions so motion feels consistent site-wide. */
export const easeOutExpo = [0.22, 1, 0.36, 1] as const;

export const springSoft: Transition = {
  type: "spring",
  duration: 0.9,
  bounce: 0.2,
};

export const springSnappy: Transition = {
  type: "spring",
  duration: 0.3,
  bounce: 0.2,
};

/** Default viewport settings for scroll-triggered reveals. */
export const revealViewport = { once: true, amount: 0.2 } as const;
