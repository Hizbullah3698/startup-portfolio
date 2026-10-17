import { Cube, Layout, Megaphone, PenNib, Strategy } from "@phosphor-icons/react/ssr";
import { projects as localProjects } from "@/data/projects";
import { services as localServices } from "@/data/services";
import { testimonials as localTestimonials } from "@/data/testimonials";
import type { IconComponent, Project, Service, Testimonial } from "@/types";

/** Optional. When unset the site uses the static data in src/data. */
const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const REQUEST_TIMEOUT_MS = 4000;
const REVALIDATE_SECONDS = 60;
const SUMMARY_MAX_LENGTH = 110;

/** Shape of a project returned by GET /api/projects/. */
interface ApiProject {
  slug: string;
  title: string;
  category: string;
  description: string;
  image_url: string | null;
  github_url: string | null;
  live_url: string | null;
}

/**
 * GET helper for public endpoints. Returns null on any failure
 * (network error, timeout, non-2xx, invalid JSON) so callers can fall back.
 */
async function publicFetch<T>(endpoint: string): Promise<T | null> {
  if (!API_BASE) return null;
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

/** Collapse whitespace and cut long text at a word boundary. */
function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

/** Remote covers must be https (next.config allows https hosts only). */
function isUsableImage(url: string | null): url is string {
  return typeof url === "string" && url.startsWith("https://");
}

function toProject(item: ApiProject): Project {
  const fallbackCover =
    localProjects.find((p) => p.slug === item.slug)?.cover ?? localProjects[0].cover;

  return {
    slug: item.slug,
    title: item.title,
    category: item.category,
    summary: truncate(item.description, SUMMARY_MAX_LENGTH),
    cover: isUsableImage(item.image_url) ? item.image_url : fallbackCover,
    href: item.live_url || item.github_url || "#",
  };
}

/** Public projects from the API, or the local static projects if unavailable. */
export async function getProjects(): Promise<Project[]> {
  const data = await publicFetch<ApiProject[]>("/api/projects/?limit=100");
  if (!Array.isArray(data) || data.length === 0) return localProjects;
  return data.map(toProject);
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

/** Shape of a testimonial returned by GET /api/testimonials/. */
interface ApiTestimonial {
  id: number;
  client_name: string;
  client_role: string | null;
  company: string | null;
  content: string;
  featured: boolean;
}

function toTestimonial(item: ApiTestimonial): Testimonial {
  return {
    slug: String(item.id),
    name: item.client_name,
    role: [item.client_role, item.company].filter(Boolean).join(", "),
    quote: item.content,
  };
}

/** Public testimonials plus the id-matched featured flag, or the local data. */
async function loadTestimonials(): Promise<{ items: Testimonial[]; featured: Testimonial }> {
  const data = await publicFetch<ApiTestimonial[]>("/api/testimonials/?limit=100");
  if (!Array.isArray(data) || data.length === 0) {
    return { items: localTestimonials, featured: localTestimonials[0] };
  }
  const items = data.map(toTestimonial);
  const featuredIndex = data.findIndex((t) => t.featured);
  return { items, featured: items[featuredIndex >= 0 ? featuredIndex : 0] };
}

/** Public testimonials from the API, or the local static ones if unavailable. */
export async function getTestimonials(): Promise<Testimonial[]> {
  return (await loadTestimonials()).items;
}

/** First featured testimonial, else the first one in the list. */
export async function getFeaturedTestimonial(): Promise<Testimonial> {
  return (await loadTestimonials()).featured;
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

/** Shape of a service returned by GET /api/services/. */
interface ApiService {
  title: string;
  description: string;
  icon: string | null;
}

const DEFAULT_SERVICE_ICON: IconComponent = Strategy;

/** Backend icon names (normalised: lowercase, letters and digits only) to icons. */
const SERVICE_ICONS: Record<string, IconComponent> = {
  strategy: Strategy,
  pennib: PenNib,
  layout: Layout,
  cube: Cube,
  megaphone: Megaphone,
};

const SERVICE_TILTS = localServices.map((s) => s.tilt);

function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function toService(item: ApiService, index: number): Service {
  const local = localServices.find((s) => normalise(s.title) === normalise(item.title));
  const icon =
    (item.icon ? SERVICE_ICONS[normalise(item.icon)] : undefined) ??
    local?.icon ??
    DEFAULT_SERVICE_ICON;

  return {
    title: item.title,
    description: item.description,
    tags: local?.tags ?? [],
    icon,
    tone: index % 2 === 0 ? "dark" : "accent",
    tilt: SERVICE_TILTS[index % SERVICE_TILTS.length],
  };
}

/** Public services from the API, or the local static ones if unavailable. */
export async function getServices(): Promise<Service[]> {
  const data = await publicFetch<ApiService[]>("/api/services/?limit=100");
  if (!Array.isArray(data) || data.length === 0) return localServices;
  return data.map(toService);
}
