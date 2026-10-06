import { Container } from "@/components/ui/Container";
import { RevealText } from "@/components/ui/RevealText";
import { Tag } from "@/components/ui/Tag";
import { TiltCard } from "@/components/ui/TiltCard";
import { services, servicesIntro, tools } from "@/data/services";
import { cn } from "@/lib/utils";
import type { Service } from "@/types";

/** Sticky intro with tools on the left, stacked tilted service cards on the right. */
export function Services() {
  return (
    <section id="services" className="section-x pb-20 pt-20 md:pt-[120px]">
      <Container className="flex flex-col gap-14 lg:flex-row lg:gap-20">
        <div className="flex flex-1 flex-col gap-10 self-start lg:sticky lg:top-[120px] lg:gap-12">
          <RevealText
            className="text-h2 text-text"
            segments={[{ text: "What I help\nyou to " }, { text: "Shape…", className: "text-accent" }]}
          />
          <p className="text-body-lg">{servicesIntro}</p>

          <div className="flex flex-col gap-4">
            <span className="text-body text-muted">Tools that I use</span>
            <ul className="flex flex-wrap gap-2.5">
              {tools.map(({ name, icon: Icon }) => (
                <li
                  key={name}
                  title={name}
                  className="flex size-[60px] items-center justify-center rounded-2xl border border-line bg-surface text-[#EDEDED] transition-[transform,background-color] duration-300 hover:-translate-y-1 hover:scale-110 hover:bg-surface-raised"
                >
                  <Icon size={24} aria-hidden />
                  <span className="sr-only">{name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-12 px-2.5 pb-[60px] pt-2.5">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="md:sticky"
              style={{ top: `${110 + index * 18}px` }}
            >
              <TiltCard tilt={service.tilt}>
                <ServiceCard service={service} />
              </TiltCard>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const { title, description, tags, icon: Icon, tone } = service;
  const isAccent = tone === "accent";

  return (
    <article
      className={cn(
        "flex min-h-[270px] flex-col gap-4 rounded-[28px] border p-6 shadow-[0_30px_60px_rgba(0,0,0,0.55)] md:p-8",
        isAccent ? "border-white/20 bg-accent" : "border-card-line bg-card",
      )}
    >
      <div className="flex items-center gap-3.5">
        <Icon size={30} aria-hidden className={isAccent ? "text-white" : "text-accent"} />
        <h3 className="text-h3 text-text">{title}</h3>
      </div>
      <p className={cn("text-body-lg", isAccent && "text-white")}>{description}</p>
      <div className="flex flex-wrap gap-2 pt-2">
        {tags.map((tag) => (
          <Tag key={tag} tone={tone}>
            {tag}
          </Tag>
        ))}
      </div>
    </article>
  );
}
