"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { List, X } from "@phosphor-icons/react";
import { navLinks, site } from "@/data/site";
import { cn } from "@/lib/utils";

/** Floating pill navigation. Collapses into a drawer below 810px. */
export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [isOpen]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 md:top-5"
    >
      <nav
        aria-label="Main"
        className={cn(
          "w-full max-w-[358px] overflow-hidden border border-white/[0.08] bg-[rgba(26,26,28,0.78)] py-2 pl-2.5 pr-2",
          "shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur-[16px]",
          "rounded-[26px] md:w-[580px] md:max-w-none md:rounded-full",
        )}
      >
        <div className="flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5" aria-label={`${site.name}, back to top`}>
            <span
              className="flex size-8 items-center justify-center rounded-full font-display text-xs font-bold text-white"
              style={{
                background:
                  "radial-gradient(50% 50% at 30% 30%, #FF5A86 0%, var(--color-accent) 55%, var(--color-accent-deep) 100%)",
              }}
            >
              {site.initials}
            </span>
            <span className="font-display text-[15px] font-bold text-text">{site.shortName}</span>
          </a>

          {/* Desktop + tablet links */}
          <div className="hidden items-center gap-[22px] md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-label text-text transition-colors hover:text-accent"
              >
                {link.label}
              </a>
            ))}
            <ContactButton />
          </div>

          {/* Phone menu toggle */}
          <button
            type="button"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsOpen((open) => !open)}
            className="flex size-9 items-center justify-center rounded-full bg-surface-raised text-white md:hidden"
          >
            {isOpen ? <X size={18} weight="bold" /> : <List size={18} weight="bold" />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden"
            >
              <div className="flex flex-col items-start gap-[18px] pb-3.5 pl-1.5 pr-1 pt-[22px]">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-label text-text"
                  >
                    {link.label}
                  </a>
                ))}
                <ContactButton onClick={() => setIsOpen(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}

function ContactButton({ onClick }: { onClick?: () => void }) {
  return (
    <a
      href="#contact"
      onClick={onClick}
      className="rounded-full bg-accent px-[18px] py-2.5 text-sm font-semibold leading-none text-white transition-[transform,background-color] duration-300 hover:scale-105 hover:bg-accent-hover"
    >
      Contact
    </a>
  );
}
