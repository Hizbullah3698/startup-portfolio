import { Quotes } from "@phosphor-icons/react/ssr";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { Marquee } from "@/components/ui/Marquee";
import { RevealText } from "@/components/ui/RevealText";
import { Stars } from "@/components/ui/Stars";
import { site } from "@/data/site";
import { testimonials } from "@/data/testimonials";
import { accentSegments } from "@/lib/text";
import { cn, getInitials } from "@/lib/utils";
import type { Testimonial } from "@/types";

/** Heading with rating badge and a full-bleed, auto-scrolling testimonial carousel. */
export function Testimonials() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="overflow-hidden border-t border-line py-20 md:py-[120px]"
    >
      <Container className="section-x flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div id="testimonials-heading" className="max-w-[560px]">
          <RevealText
            className="text-h2 text-text"
            segments={accentSegments("Hear from what ", "my clients have to say.")}
          />
        </div>
        <ClientsBadge />
      </Container>

      <FadeIn offsetY={30} className="mt-14">
        <Marquee speed={50} hoverSpeed={0.25} gap={16} fadeEdges={false}>
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.slug} testimonial={testimonial} />
          ))}
        </Marquee>
      </FadeIn>
    </section>
  );
}

/** Overlapping client avatars + stars + client count. */
function ClientsBadge() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {testimonials.slice(0, 5).map((testimonial) => (
          <Avatar key={testimonial.slug} name={testimonial.name} className="size-9 text-[10px]" />
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <Stars size={12} />
        <span className="text-[15px] font-medium leading-none text-text-soft">
          {site.happyClients}
        </span>
      </div>
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-[300px] w-[280px] shrink-0 flex-col justify-between rounded-[20px] border border-line bg-background p-6 transition-colors duration-300 hover:border-white/20 hover:bg-surface md:h-[345px] md:w-[320px]">
      <div className="flex flex-col gap-3">
        <Quotes size={18} weight="fill" className="text-text" aria-hidden />
        <blockquote className="text-[17px] leading-[1.4] text-muted md:text-[19px]">
          {testimonial.quote}
        </blockquote>
      </div>
      <div className="flex flex-col gap-4">
        <Stars size={12} />
        <figcaption className="flex items-center gap-3">
          <Avatar name={testimonial.name} className="size-10 text-[13px]" />
          <div className="flex flex-col gap-1">
            <span className="text-base font-semibold leading-none text-text">
              {testimonial.name}
            </span>
            <span className="text-small text-muted">{testimonial.role}</span>
          </div>
        </figcaption>
      </div>
    </figure>
  );
}

/** Initials avatar used until real client photos are added. */
function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border-2 border-background bg-surface-raised font-display font-bold text-text",
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
