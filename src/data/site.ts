import {
  EnvelopeSimple,
  InstagramLogo,
  LinkedinLogo,
} from "@phosphor-icons/react/ssr";
import type { NavLink, SocialLink } from "@/types";

/**
 * Global site content. Replace the placeholder values below with your own.
 */
export const site = {
  name: "Alex Carter",
  shortName: "Alex C.",
  initials: "AC",
  role: "Brand Designer · Visual Communicator · UI/UX",
  tagline: "I help brands turn ideas into structured, meaningful experiences",
  description:
    "Alex Carter is a brand designer and visual communicator helping brands turn ideas into structured, meaningful experiences.",
  url: "https://example.com",
  email: "hello@example.com",
  bookingUrl: "https://cal.com/",
  happyClients: "50+ happy clients",
  year: 2026,
} as const;

export const navLinks: NavLink[] = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
];

export const footerLinks: NavLink[] = [...navLinks, { label: "FAQs", href: "#faq" }];

export const socialLinks: SocialLink[] = [
  { label: "Instagram", href: "https://instagram.com/", icon: InstagramLogo },
  { label: "LinkedIn", href: "https://linkedin.com/", icon: LinkedinLogo },
  { label: "Email", href: `mailto:${site.email}`, icon: EnvelopeSimple },
];

/** Disciplines that scroll in the trust strip marquee. */
export const disciplines: string[] = [
  "Brand Identity",
  "UI/UX Design",
  "Packaging Design",
  "Design Strategy",
  "Digital Design",
  "Art Direction",
];
