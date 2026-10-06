import { CalendarBlank, EnvelopeSimple } from "@phosphor-icons/react/ssr";
import { FadeIn } from "@/components/ui/FadeIn";
import { site } from "@/data/site";

/** "Speak to me" pill pinned to the bottom of the viewport. */
export function FloatingContact() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[18px] z-40 flex justify-center px-4">
      <FadeIn trigger="mount" offsetY={60} delay={1.2} className="pointer-events-auto">
        <div className="flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-[rgba(26,26,28,0.86)] py-2 pl-5 pr-2 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-[16px]">
          <div className="flex flex-col gap-[3px] pr-9">
            <span className="text-[15px] font-semibold leading-[1.2] text-text">Speak to me</span>
            <span className="text-xs leading-[1.3] text-muted">Email or book a call</span>
          </div>
          <a
            href={`mailto:${site.email}`}
            aria-label="Send me an email"
            className="flex size-[42px] items-center justify-center rounded-full bg-accent text-white transition-transform duration-300 hover:scale-110"
          >
            <EnvelopeSimple size={18} weight="bold" />
          </a>
          <a
            href={site.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Book a call"
            className="flex size-[42px] items-center justify-center rounded-full bg-surface-raised text-white transition-transform duration-300 hover:scale-110"
          >
            <CalendarBlank size={18} weight="bold" />
          </a>
        </div>
      </FadeIn>
    </div>
  );
}
