import { Container } from "@/components/ui/Container";
import { RevealText } from "@/components/ui/RevealText";
import { featuredTestimonial } from "@/data/testimonials";
import { getInitials } from "@/lib/utils";

/** A single, centred client quote between the projects and services. */
export function FeaturedQuote() {
  const { quote, name, role } = featuredTestimonial;

  return (
    <section aria-label="Client quote" className="section-x border-y border-line py-16 md:py-24">
      <Container size="narrow" className="flex flex-col items-center gap-[30px]">
        <RevealText
          as="p"
          className="text-quote text-center text-text-soft"
          segments={[{ text: `“${quote}”` }]}
          stagger={0.03}
        />
        <figure className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full border border-line bg-surface-raised font-display text-sm font-bold text-text">
            {getInitials(name)}
          </span>
          <figcaption className="flex flex-col gap-1">
            <span className="text-[15px] font-semibold leading-[1.2] text-text">{name}</span>
            <span className="text-small text-muted">{role}</span>
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}
