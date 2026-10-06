import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { RevealText } from "@/components/ui/RevealText";
import { aboutStory, experience } from "@/data/about";
import { site, socialLinks } from "@/data/site";
import { accentSegments } from "@/lib/text";

/** Portrait card, story and work history. */
export function About() {
  return (
    <section id="about" className="section-x border-t border-line py-20 md:py-[120px]">
      <Container className="flex flex-col gap-16">
        <RevealText
          className="text-h2 text-text"
          segments={accentSegments("Designing experiences\n", "that make sense.")}
        />

        <div className="flex flex-col gap-12 md:flex-row md:gap-16">
          {/* Profile */}
          <div className="flex w-full flex-col gap-2 self-start md:sticky md:top-[110px] md:w-[340px] lg:w-[420px]">
            <FadeIn offsetY={40}>
              <div className="relative flex h-[440px] items-end justify-end overflow-hidden rounded-[26px] border border-white/[0.08] p-4 md:h-[520px]">
                <Image
                  src="/images/about-portrait.jpg"
                  alt={`Portrait of ${site.name}`}
                  fill
                  sizes="(min-width: 1200px) 420px, (min-width: 810px) 340px, 100vw"
                  className="object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(234, 0, 68, 0.05) 0%, rgba(234, 0, 68, 0.55) 100%)",
                  }}
                />
                <ul className="relative z-10 flex gap-2">
                  {socialLinks.map(({ label, href, icon: Icon }) => (
                    <li key={label}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="flex size-[38px] items-center justify-center rounded-xl border border-white/[0.12] bg-black/50 text-white backdrop-blur-[10px] transition-[transform,background-color] duration-300 hover:scale-110 hover:bg-accent"
                      >
                        <Icon size={18} aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
            <h3 className="text-h3 pt-2 text-text">{site.name}</h3>
            <p className="text-body-lg text-muted">{site.role}</p>
          </div>

          {/* Story + history */}
          <div className="flex flex-1 flex-col gap-10">
            <FadeIn offsetY={20} className="flex flex-col gap-5">
              {aboutStory.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="text-body-lg">
                  {paragraph}
                </p>
              ))}
            </FadeIn>

            <div className="flex flex-col gap-4">
              <h3 className="text-h4 text-text">My work history</h3>
              <ul className="flex flex-col gap-2.5">
                {experience.map((job, index) => (
                  <li key={job.company}>
                    <FadeIn offsetY={20} delay={index * 0.08}>
                      <div className="flex items-center justify-between gap-4 rounded-[18px] border border-line bg-surface px-[22px] py-[18px] transition-[transform,background-color] duration-300 hover:scale-[1.02] hover:bg-surface-raised">
                        <div className="flex flex-col gap-1">
                          <span className="font-display text-[17px] font-bold leading-[1.2] text-text">
                            {job.company}
                          </span>
                          <span className="text-small text-muted">{job.role}</span>
                        </div>
                        <span className="shrink-0 text-[13px] font-medium leading-none text-text-soft">
                          {job.period}
                        </span>
                      </div>
                    </FadeIn>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
