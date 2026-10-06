import { Cube, Layout, Megaphone, PenNib, Strategy } from "@phosphor-icons/react/ssr";
import {
  TbBrandAdobeIllustrator,
  TbBrandAdobePhotoshop,
  TbBrandOpenai,
} from "react-icons/tb";
import { SiAnthropic, SiFigma, SiFramer, SiNotion } from "react-icons/si";
import type { Service, Tool } from "@/types";

export const services: Service[] = [
  {
    title: "Design Strategy",
    description:
      "Understanding the problem clearly before designing the solution. Every decision is based on purpose.",
    tags: ["Research", "Positioning", "Creative Direction"],
    icon: Strategy,
    tone: "dark",
    tilt: 3,
  },
  {
    title: "Brand Identity",
    description:
      "Creating strong visual systems that communicate clearly and stay consistent across every touchpoint.",
    tags: ["Logo Design", "Visual Identity Systems", "Typography", "Brand Guidelines"],
    icon: PenNib,
    tone: "accent",
    tilt: -4,
  },
  {
    title: "UI/UX Design",
    description:
      "Designing interfaces that feel intuitive, purposeful and genuinely easy to use.",
    tags: ["Wireframes", "Prototyping", "Design Systems"],
    icon: Layout,
    tone: "dark",
    tilt: 2.5,
  },
  {
    title: "Packaging Design",
    description:
      "Designing packaging that stands out on the shelf and communicates product value instantly.",
    tags: ["Label Design", "Mockups", "Print-Ready Files"],
    icon: Cube,
    tone: "accent",
    tilt: -3,
  },
  {
    title: "Digital Design",
    description:
      "Creating visuals that grab attention and communicate clearly across digital platforms.",
    tags: ["Social Media Creatives", "Ad Creatives", "Web Graphics"],
    icon: Megaphone,
    tone: "dark",
    tilt: 3.5,
  },
];

export const servicesIntro =
  "From the first strategy session to the final file, every project gets the same care: clear thinking, honest feedback and design that works.";

export const tools: Tool[] = [
  { name: "Adobe Photoshop", icon: TbBrandAdobePhotoshop },
  { name: "Adobe Illustrator", icon: TbBrandAdobeIllustrator },
  { name: "Figma", icon: SiFigma },
  { name: "Framer", icon: SiFramer },
  { name: "Notion", icon: SiNotion },
  { name: "OpenAI", icon: TbBrandOpenai },
  { name: "Anthropic", icon: SiAnthropic },
];
