import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/Button";
import { CursorFollowCharacter } from "@/components/ui/CursorFollowCharacter";
import { FadeIn } from "@/components/ui/FadeIn";
import { RevealText } from "@/components/ui/RevealText";
import { site } from "@/data/site";

/**
 * Opening section: huge two-line heading with the 3D character in front,
 * pitch text bottom-left and the booking button bottom-right.
 */
export function Hero() {
  return (
    <section
      id="top"
      className="section-x relative flex min-h-svh flex-col items-center justify-start overflow-hidden md:justify-center pb-12 pt-[384px] md:pb-14 md:pt-[130px]"
    >
      {/* Red glow rising from the bottom */}
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-end justify-center">
        <div
          className="h-[460px] w-full max-w-[1000px]"
          style={{
            background:
              "radial-gradient(50% 70% at 50% 100%, rgba(234, 0, 68, 0.42) 0%, rgba(234, 0, 68, 0) 100%)",
          }}
        />
      </div>

      {/* Heading — sits behind the character */}
      <RevealText
        as="h1"
        by="char"
        trigger="mount"
        offsetY={60}
        blur={10}
        delay={0.1}
        className="text-display relative z-10 w-full text-center text-text"
        segments={[{ text: "THINK\n" }, { text: "CREATIVELY", className: "text-accent" }]}
      />

      {/* Character — in front of the heading */}
      <div className="pointer-events-none absolute inset-0 z-20 flex justify-center pt-[88px] md:items-center md:pt-[60px] lg:pt-10">
        <FadeIn trigger="mount" offsetY={60} scale={0.9} delay={0.45} duration={1.1}>
          <CursorFollowCharacter
            src="/images/hero-character.png"
            alt="3D cartoon portrait of the designer"
            priority
            className="h-[312px] w-[250px] md:h-[500px] md:w-[400px] lg:h-[625px] lg:w-[500px]"
          />
        </FadeIn>
      </div>

      {/* Pitch + CTA */}
      <div className="relative z-30 flex w-full max-w-content flex-col items-center gap-6 pt-8 text-center md:flex-row md:items-end md:justify-between md:pt-16 md:text-left">
        <FadeIn trigger="mount" offsetY={20} delay={0.9}>
          <p className="text-body-lg max-w-[320px] text-balance md:max-w-[260px]">{site.tagline}</p>
        </FadeIn>
        <FadeIn trigger="mount" offsetY={20} delay={1}>
          <Button href={site.bookingUrl} size="lg">
            Book a call with me
            <ArrowUpRight size={18} weight="bold" aria-hidden />
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
