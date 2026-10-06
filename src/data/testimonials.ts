import type { Testimonial } from "@/types";

export const testimonials: Testimonial[] = [
  {
    slug: "jordan-mills",
    name: "Jordan Mills",
    role: "CTO, Kitebird",
    quote:
      "Alex’s approach is structured. Clarity comes before decoration, and it shows in every detail. Nothing felt random.",
  },
  {
    slug: "priya-shah",
    name: "Priya Shah",
    role: "Founder, Halcyon",
    quote:
      "Great creativity and precision. The new identity finally feels like us, and our clients noticed right away.",
  },
  {
    slug: "marco-diaz",
    name: "Marco Diaz",
    role: "Marketing Lead, Tidewater",
    quote:
      "Strong visuals with real attention to detail. Engagement went up the week we launched.",
  },
  {
    slug: "hana-kim",
    name: "Hana Kim",
    role: "Product Manager, Kitebird",
    quote:
      "Fast, thoughtful and easy to work with. Every round of feedback moved the product forward.",
  },
  {
    slug: "tom-reyes",
    name: "Tom Reyes",
    role: "Owner, Pulp Theory",
    quote:
      "The packaging stands out on the shelf. Retailers noticed it before our customers did.",
  },
  {
    slug: "lena-wolfe",
    name: "Lena Wolfe",
    role: "CEO, Orbit Lab",
    quote:
      "Turned a messy brief into a clean, confident brand system our whole team can use.",
  },
];

/** The testimonial highlighted in the single-quote band under the projects. */
export const featuredTestimonial = testimonials[0];
