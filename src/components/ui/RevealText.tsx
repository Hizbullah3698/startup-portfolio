"use client";

import { Fragment, type ElementType } from "react";
import { motion, type Variants } from "motion/react";
import type { TextSegment } from "@/lib/text";

interface RevealTextProps {
  segments: TextSegment[];
  as?: "h1" | "h2" | "h3" | "p" | "div" | "span";
  /** Animate word-by-word or character-by-character. */
  by?: "word" | "char";
  /** Animate on page load or when scrolled into view. */
  trigger?: "mount" | "inView";
  /** Starting vertical offset in px. */
  offsetY?: number;
  blur?: number;
  delay?: number;
  stagger?: number;
  className?: string;
}

const MotionTags: Record<string, ElementType> = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  div: motion.div,
  span: motion.span,
};

/**
 * Splits text into words (or characters) that fade, rise and un-blur in
 * sequence. Screen readers get the full sentence via the visually hidden copy.
 */
export function RevealText({
  segments,
  as = "h2",
  by = "word",
  trigger = "inView",
  offsetY = 30,
  blur = 8,
  delay = 0,
  stagger,
  className,
}: RevealTextProps) {
  const Tag = MotionTags[as] ?? motion.div;
  const step = stagger ?? (by === "char" ? 0.035 : 0.06);

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: step, delayChildren: delay } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: offsetY, filter: `blur(${blur}px)` },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", duration: 0.9, bounce: 0 },
    },
  };

  const plainText = segments.map((s) => s.text.replace(/\n/g, " ")).join("");
  const animateProps =
    trigger === "mount"
      ? { initial: "hidden", animate: "visible" }
      : {
          initial: "hidden",
          whileInView: "visible",
          viewport: { once: true, amount: 0.4 },
        };

  return (
    <Tag className={className} variants={container} {...animateProps}>
      <span className="sr-only">{plainText}</span>
      <span aria-hidden>
        {segments.map((segment, segmentIndex) => (
          <span key={segmentIndex} className={segment.className}>
            {segment.text.split("\n").map((line, lineIndex) => (
              <Fragment key={lineIndex}>
                {lineIndex > 0 && <br />}
                {line.split(/(\s+)/).map((word, wordIndex) => {
                  if (word === "") return null;
                  if (/^\s+$/.test(word)) return <Fragment key={wordIndex}> </Fragment>;
                  if (by === "word") {
                    return (
                      <motion.span key={wordIndex} variants={item} className="inline-block">
                        {word}
                      </motion.span>
                    );
                  }
                  return (
                    <span key={wordIndex} className="inline-block whitespace-nowrap">
                      {Array.from(word).map((char, charIndex) => (
                        <motion.span key={charIndex} variants={item} className="inline-block">
                          {char}
                        </motion.span>
                      ))}
                    </span>
                  );
                })}
              </Fragment>
            ))}
          </span>
        ))}
      </span>
    </Tag>
  );
}
