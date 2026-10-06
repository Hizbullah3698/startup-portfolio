import type { ComponentType } from "react";

/** Any icon component (Phosphor or react-icons) that accepts a size and class. */
export type IconComponent = ComponentType<{
  size?: number | string;
  className?: string;
  "aria-hidden"?: boolean;
}>;

export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: IconComponent;
}

export interface Project {
  slug: string;
  title: string;
  category: string;
  summary: string;
  cover: string;
  href: string;
}

export type ServiceTone = "dark" | "accent";

export interface Service {
  title: string;
  description: string;
  tags: string[];
  icon: IconComponent;
  tone: ServiceTone;
  /** Resting tilt of the card in degrees. */
  tilt: number;
}

export interface Tool {
  name: string;
  icon: IconComponent;
}

export interface Testimonial {
  slug: string;
  name: string;
  role: string;
  quote: string;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
}

export interface Faq {
  question: string;
  answer: string;
}
