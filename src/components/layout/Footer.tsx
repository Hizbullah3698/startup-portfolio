import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { RevealText } from "@/components/ui/RevealText";
import { footerLinks, site, socialLinks } from "@/data/site";

/** Closing CTA, contact details and the giant name wordmark. */
export function Footer() {
  const socials = socialLinks.filter((link) => !link.href.startsWith("mailto:"));

  return (
    <footer id="contact" className="section-x relative overflow-hidden border-t border-line py-20 md:py-[120px]">
      {/* Soft glow behind the wordmark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%]"
        style={{
          background:
            "radial-gradient(50% 60% at 50% 100%, rgba(234, 0, 68, 0.28) 0%, rgba(234, 0, 68, 0) 100%)",
        }}
      />

      <Container className="relative flex flex-col gap-14">
        <RevealText
          as="h2"
          className="text-h2 text-text"
          segments={[
            { text: "Let’s " },
            { text: "design", className: "font-marker font-normal text-accent" },
            { text: "\nincredible work together." },
          ]}
        />

        <div className="grid grid-cols-1 gap-7 border-b border-line pb-9 md:grid-cols-3">
          <ContactItem label="Email">
            <a href={`mailto:${site.email}`} className="transition-colors hover:text-accent">
              {site.email}
            </a>
          </ContactItem>
          <ContactItem label="Call me">
            <a
              href={site.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-accent"
            >
              Book a call
            </a>
          </ContactItem>
          <ContactItem label="Social">
            <div className="flex gap-[22px]">
              {socials.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-accent"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </ContactItem>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-small text-muted">Menu</span>
            <nav aria-label="Footer" className="flex flex-wrap gap-6">
              {footerLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[17px] font-medium leading-[1.3] text-text transition-colors hover:text-accent"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <p className="text-small text-muted">
            © {site.year} {site.name}
          </p>
        </div>

        <FadeIn offsetY={60}>
          <p
            aria-hidden
            className="whitespace-nowrap text-center font-display font-bold uppercase leading-none tracking-[-0.04em] text-accent"
            style={{
              fontSize: "clamp(48px, 15.2vw, 182px)",
              textShadow: "0 0 80px rgba(234, 0, 68, 0.45)",
            }}
          >
            {site.name}
          </p>
        </FadeIn>
      </Container>
    </footer>
  );
}

function ContactItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-small text-muted">{label}</span>
      <div className="text-lg font-medium leading-[1.3] text-text">{children}</div>
    </div>
  );
}
