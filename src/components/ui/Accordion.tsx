"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus } from "@phosphor-icons/react";
import { cn, padIndex } from "@/lib/utils";
import type { Faq } from "@/types";

interface AccordionProps {
  items: Faq[];
  /** Index of the item open on first render (null for all closed). */
  defaultOpen?: number | null;
  className?: string;
}

/** Numbered FAQ accordion. One item open at a time, with smooth height animation. */
export function Accordion({ items, defaultOpen = 0, className }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen);
  const baseId = useId();

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const buttonId = `${baseId}-q-${index}`;
        const panelId = `${baseId}-a-${index}`;

        return (
          <div
            key={item.question}
            className={cn(
              "rounded-[18px] border border-line bg-surface transition-colors duration-300",
              isOpen ? "bg-surface-raised" : "hover:bg-surface-raised/60",
            )}
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center gap-4 px-[22px] py-5 text-left"
              >
                <span className="text-sm font-medium text-muted">{padIndex(index + 1)}</span>
                <span className="flex-1 text-base font-medium leading-[1.35] text-text">
                  {item.question}
                </span>
                <motion.span
                  className="text-text-soft"
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  {isOpen ? <Minus size={18} weight="bold" /> : <Plus size={18} weight="bold" />}
                </motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="text-body pb-[22px] pl-[54px] pr-[22px] text-muted">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
