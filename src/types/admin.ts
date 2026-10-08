export interface AdminUser {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export type InquiryStatus = "new" | "read" | "replied" | "archived";

export interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
}

export interface ContactInquiryUpdate {
  status?: InquiryStatus;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export interface DashboardStats {
  total_projects: number;
  featured_projects: number;
  total_services: number;
  featured_services: number;
  total_testimonials: number;
  total_inquiries: number;
  new_inquiries: number;
  recent_inquiries: ContactInquiry[];
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  technologies: string[];
  image_url: string | null;
  github_url: string | null;
  live_url: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectInput {
  title: string;
  slug: string;
  description: string;
  category: string;
  technologies: string[];
  image_url?: string | null;
  github_url?: string | null;
  live_url?: string | null;
  featured?: boolean;
}

export interface Service {
  id: number;
  title: string;
  slug: string;
  description: string;
  icon: string;
  featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceInput {
  title: string;
  slug: string;
  description: string;
  icon: string;
  featured?: boolean;
  display_order?: number;
}

export interface Testimonial {
  id: number;
  client_name: string;
  client_role: string;
  company: string;
  content: string;
  rating: number;
  avatar_url: string | null;
  featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TestimonialInput {
  client_name: string;
  client_role: string;
  company: string;
  content: string;
  rating: number;
  avatar_url?: string | null;
  featured?: boolean;
  display_order?: number;
}
