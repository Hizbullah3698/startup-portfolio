import { StarFour } from "@phosphor-icons/react/ssr";
import { Container } from "@/components/ui/Container";
import { Marquee } from "@/components/ui/Marquee";
import { Stars } from "@/components/ui/Stars";
import { disciplines, site } from "@/data/site";

/** Rating badge next to an infinite ticker of disciplines. */
export function TrustStrip() {
  return (
    <section aria-label="Client rating and disciplines" className="section-x border-y border-line py-[26px]">
      <Container className="flex flex-col items-start gap-5 md:flex-row md:items-center md:gap-12">
        <div className="flex shrink-0 flex-col gap-2">
          <Stars />
          <span className="text-small text-muted">{site.happyClients}</span>
        </div>

        <Marquee speed={45} hoverSpeed={0.4} gap={40} className="w-full flex-1 py-1.5">
          {disciplines.map((discipline) => (
            <div key={discipline} className="flex items-center gap-10">
              <span className="whitespace-nowrap font-display text-xl font-bold leading-none tracking-[-0.01em] text-ticker">
                {discipline}
              </span>
              <StarFour size={14} weight="bold" className="text-accent" aria-hidden />
            </div>
          ))}
        </Marquee>
      </Container>
    </section>
  );
}
