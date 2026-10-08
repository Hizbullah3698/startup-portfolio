import type {
  AdminUser,
  ContactInquiry,
  ContactInquiryUpdate,
  DashboardStats,
  InquiryStatus,
  LoginResponse,
  Project,
  ProjectInput,
  Service,
  ServiceInput,
  Testimonial,
  TestimonialInput,
} from "@/types/admin";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";

const TOKEN_COOKIE_NAME = "admin_token";
const TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

// NOTE: The admin token is stored as a JS-readable client cookie (SameSite=Lax)
// so that both client-side fetch wrappers and Next.js navigation guards can access it.
// A formal security review and hardening will take place in Part 8.

export function setAdminToken(token: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(
    token
  )}; path=/; max-age=${TOKEN_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function getAdminToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${TOKEN_COOKIE_NAME}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function removeAdminToken(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function adminFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeAdminToken();
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/admin/login")
    ) {
      window.location.href = "/admin/login";
    }
    throw new ApiError(401, "Session expired or unauthorized. Please log in again.");
  }

  if (response.status === 204) {
    return null as T;
  }

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson && typeof errJson === "object") {
        if (typeof errJson.detail === "string") {
          errorDetail = errJson.detail;
        } else if (Array.isArray(errJson.detail)) {
          errorDetail = errJson.detail.map((e: { msg?: string }) => e.msg || JSON.stringify(e)).join(", ");
        }
      }
    } catch {
      // Use fallback errorDetail if JSON parsing fails
    }
    throw new ApiError(response.status, errorDetail);
  }

  return (await response.json()) as T;
}

// ---------------------------------------------------------------------------
// Authentication API
// ---------------------------------------------------------------------------
export async function loginAdmin(
  username: string,
  password: string
): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    let detail = "Invalid username or password";
    try {
      const data = await response.json();
      if (data?.detail) detail = data.detail;
    } catch {
      // Use fallback detail
    }
    throw new ApiError(response.status, detail);
  }

  const data = (await response.json()) as LoginResponse;
  setAdminToken(data.access_token);
  return data;
}

export async function getMe(): Promise<AdminUser> {
  return adminFetch<AdminUser>("/api/auth/me");
}

export function logoutAdmin(): void {
  removeAdminToken();
  if (typeof window !== "undefined") {
    window.location.href = "/admin/login";
  }
}

// ---------------------------------------------------------------------------
// Dashboard Statistics
// ---------------------------------------------------------------------------
export async function getDashboardStats(): Promise<DashboardStats> {
  return adminFetch<DashboardStats>("/api/admin/stats");
}

// ---------------------------------------------------------------------------
// Projects CRUD
// ---------------------------------------------------------------------------
export async function getAdminProjects(skip = 0, limit = 100): Promise<Project[]> {
  return adminFetch<Project[]>(`/api/projects/?skip=${skip}&limit=${limit}`);
}

export async function createProject(data: ProjectInput): Promise<Project> {
  return adminFetch<Project>("/api/projects/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProject(
  id: number,
  data: Partial<ProjectInput>
): Promise<Project> {
  return adminFetch<Project>(`/api/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: number): Promise<void> {
  return adminFetch<void>(`/api/projects/${id}`, {
    method: "DELETE",
  });
}

// ---------------------------------------------------------------------------
// Services CRUD
// ---------------------------------------------------------------------------
export async function getAdminServices(): Promise<Service[]> {
  return adminFetch<Service[]>("/api/services/");
}

export async function createService(data: ServiceInput): Promise<Service> {
  return adminFetch<Service>("/api/services/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateService(
  id: number,
  data: Partial<ServiceInput>
): Promise<Service> {
  return adminFetch<Service>(`/api/services/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteService(id: number): Promise<void> {
  return adminFetch<void>(`/api/services/${id}`, {
    method: "DELETE",
  });
}

// ---------------------------------------------------------------------------
// Testimonials CRUD
// ---------------------------------------------------------------------------
export async function getAdminTestimonials(): Promise<Testimonial[]> {
  return adminFetch<Testimonial[]>("/api/testimonials/");
}

export async function createTestimonial(data: TestimonialInput): Promise<Testimonial> {
  return adminFetch<Testimonial>("/api/testimonials/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTestimonial(
  id: number,
  data: Partial<TestimonialInput>
): Promise<Testimonial> {
  return adminFetch<Testimonial>(`/api/testimonials/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTestimonial(id: number): Promise<void> {
  return adminFetch<void>(`/api/testimonials/${id}`, {
    method: "DELETE",
  });
}

// ---------------------------------------------------------------------------
// Contact Inquiries
// ---------------------------------------------------------------------------
export async function getAdminInquiries(
  statusFilter?: InquiryStatus,
  skip = 0,
  limit = 100
): Promise<ContactInquiry[]> {
  const query = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });
  if (statusFilter) {
    query.set("status", statusFilter);
  }
  return adminFetch<ContactInquiry[]>(`/api/contact/?${query.toString()}`);
}

export async function getInquiry(id: number): Promise<ContactInquiry> {
  return adminFetch<ContactInquiry>(`/api/contact/${id}`);
}

export async function updateInquiryStatus(
  id: number,
  data: ContactInquiryUpdate
): Promise<ContactInquiry> {
  return adminFetch<ContactInquiry>(`/api/contact/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteInquiry(id: number): Promise<void> {
  return adminFetch<void>(`/api/contact/${id}`, {
    method: "DELETE",
  });
}
