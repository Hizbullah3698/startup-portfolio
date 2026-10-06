import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { RevealText } from "@/components/ui/RevealText";
import { projects } from "@/data/projects";
import { accentSegments } from "@/lib/text";
import type { Project } from "@/types";

/** "Latest Projects" heading and the 2×2 project grid. */
export function Projects() {
  return (
    <section id="work" className="section-x py-20 md:py-[120px]">
      <Container className="flex flex-col gap-14">
        <RevealText className="text-h2 text-text" segments={accentSegments("Latest ", "Projects")} />

        <ul className="grid grid-cols-1 gap-x-7 gap-y-10 md:grid-cols-2 md:gap-y-14">
          {projects.map((project) => (
            <li key={project.slug}>
              <FadeIn offsetY={50}>
                <ProjectCard project={project} />
              </FadeIn>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <a href={project.href} className="group flex flex-col gap-[18px]">
      <div className="relative h-[280px] overflow-hidden rounded-[22px] border border-white/[0.06] bg-surface md:h-[340px] lg:h-[400px]">
        <Image
          src={project.cover}
          alt={`${project.title} — ${project.summary}`}
          fill
          sizes="(min-width: 810px) 540px, 100vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-h4 text-text">{project.title}</h3>
          <p className="text-small text-muted">{project.category}</p>
        </div>
        <span className="flex items-center gap-1.5 py-1 text-[13px] font-medium leading-none text-text-soft transition-[opacity,transform] duration-300 group-hover:scale-105 group-hover:opacity-70">
          <ArrowUpRight size={14} weight="bold" aria-hidden />
          View Project
        </span>
      </div>
    </a>
  );
}
