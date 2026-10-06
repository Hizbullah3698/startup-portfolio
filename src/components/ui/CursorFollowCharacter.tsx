"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";

interface CursorFollowCharacterProps {
  src: string;
  alt: string;
  /** Max horizontal travel in px. */
  rangeX?: number;
  /** Max vertical travel in px. */
  rangeY?: number;
  /** Max tilt in degrees. */
  tilt?: number;
  stiffness?: number;
  damping?: number;
  /** Bottom fade as a percentage of the height. */
  fadeBottom?: number;
  glowColor?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

/**
 * A hero character that drifts toward the mouse with a soft spring and a
 * slight tilt in the direction of travel. On touch devices (or with reduced
 * motion) it switches to a gentle idle float.
 */
export function CursorFollowCharacter({
  src,
  alt,
  rangeX = 60,
  rangeY = 36,
  tilt = 6,
  stiffness = 90,
  damping = 18,
  fadeBottom = 22,
  glowColor = "rgba(234, 0, 68, 0.45)",
  priority = false,
  sizes = "(min-width: 1200px) 500px, (min-width: 810px) 400px, 250px",
  className,
}: CursorFollowCharacterProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isTouch, setIsTouch] = useState(false);

  // Pointer position normalised to -1..1 on each axis (0 = viewport centre).
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness, damping, mass: 1 });
  const springY = useSpring(pointerY, { stiffness, damping, mass: 1 });

  const x = useTransform(springX, (v) => v * rangeX);
  const y = useTransform(springY, (v) => v * rangeY);
  const rotate = useTransform(springX, (v) => v * tilt);
  const rotateY = useTransform(springX, (v) => v * tilt * 1.5);
  const rotateX = useTransform(springY, (v) => -v * tilt);

  const floatY = useMotionValue(0);

  useEffect(() => {
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    setIsTouch(coarse);
    if (coarse || prefersReducedMotion) return;

    const handleMove = (event: PointerEvent) => {
      const clamp = (n: number) => Math.max(-1, Math.min(1, n));
      pointerX.set(clamp((event.clientX / window.innerWidth) * 2 - 1));
      pointerY.set(clamp((event.clientY / window.innerHeight) * 2 - 1));
    };
    const handleLeave = () => {
      pointerX.set(0);
      pointerY.set(0);
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
    };
  }, [pointerX, pointerY, prefersReducedMotion]);

  useEffect(() => {
    if (!isTouch || prefersReducedMotion) return;
    const controls = animate(floatY, [0, -12, 0], {
      duration: 4,
      ease: "easeInOut",
      repeat: Infinity,
    });
    return () => controls.stop();
  }, [isTouch, prefersReducedMotion, floatY]);

  const followsPointer = !isTouch && !prefersReducedMotion;
  const mask = `linear-gradient(to bottom, #000 ${100 - fadeBottom}%, transparent 100%), linear-gradient(to right, transparent 0%, #000 9%, #000 91%, transparent 100%)`;

  return (
    <div
      className={cn("pointer-events-none relative select-none", className)}
      style={{ perspective: 900 }}
    >
      <div
        aria-hidden
        className="absolute inset-x-[10%] bottom-[4%] h-[55%] rounded-full blur-[30px]"
        style={{
          background: `radial-gradient(50% 50% at 50% 50%, ${glowColor} 0%, transparent 100%)`,
        }}
      />
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{
          x: followsPointer ? x : 0,
          y: followsPointer ? y : floatY,
          rotate: followsPointer ? rotate : 0,
          rotateX: followsPointer ? rotateX : 0,
          rotateY: followsPointer ? rotateY : 0,
          maskImage: mask,
          WebkitMaskImage: mask,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          draggable={false}
          className="object-contain object-bottom"
        />
      </motion.div>
    </div>
  );
}
