# Startup Portfolio

Personal portfolio for a brand & UI/UX designer — a dark, crimson-accented one-pager with a 3D character that follows the cursor.

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4** and **Motion**.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script              | What it does                    |
| ------------------- | ------------------------------- |
| `npm run dev`       | Start the dev server            |
| `npm run build`     | Production build (lint + types) |
| `npm run start`     | Serve the production build      |
| `npm run lint`      | ESLint                          |
| `npm run typecheck` | TypeScript only                 |

## Folder structure

```
public/images/             Static assets (kebab-case file names)
  hero-character.png       Transparent 3D character used in the hero
  projects/                Project cover images
src/
  app/
    layout.tsx             Fonts, metadata, <html>/<body>
    page.tsx               Composes the page from sections
    globals.css            Design tokens (@theme) + type scale utilities
    icon.tsx               Generated favicon
  components/
    layout/                Navbar, Footer, FloatingContact
    sections/              One file per page section, in page order
    ui/                    Reusable building blocks
  data/                    ALL editable content lives here
  lib/                     Helpers (cn, motion presets, text segments)
  types/                   Shared TypeScript types
```

### Naming conventions

- **Components:** `PascalCase.tsx`, named exports (`export function Hero()`).
- **Data, lib, types:** `camelCase.ts`.
- **Assets:** `kebab-case.ext`.
- Client components start with `"use client"` and are kept small (animation, state). Sections are server components that compose them.

## Editing content

Everything you see on the page comes from `src/data/`:

| File              | Content                                          |
| ----------------- | ------------------------------------------------ |
| `site.ts`         | Name, tagline, email, booking link, nav, socials |
| `projects.ts`     | Project cards                                    |
| `services.ts`     | Service cards (tone + tilt) and tools            |
| `testimonials.ts` | Testimonials + the featured quote                |
| `about.ts`        | Bio paragraphs + work history                    |
| `faqs.ts`         | FAQ accordion                                    |

To swap the hero character, replace `public/images/hero-character.png` with a transparent PNG (portrait, ~4:5). Movement range, tilt and spring feel are props on `<CursorFollowCharacter />` in `src/components/sections/Hero.tsx`.

## Design tokens

Colours, fonts, breakpoints and the type scale are defined once in `src/app/globals.css`:

- **Colours:** `background`, `surface`, `surface-raised`, `line`, `text`, `text-soft`, `muted`, `accent`, `accent-hover`, `accent-deep` → use as `bg-surface`, `text-accent`, `border-line`, …
- **Type:** `text-display`, `text-h2`, `text-h3`, `text-h4`, `text-quote`, `text-body-lg`, `text-body`, `text-small`, `text-label`
- **Breakpoints:** phone `< 810px`, `md` tablet `≥ 810px`, `lg` desktop `≥ 1200px`

## Animations

| Effect                    | Where                                       |
| ------------------------- | ------------------------------------------- |
| Cursor-follow + tilt      | `ui/CursorFollowCharacter.tsx` (idle float on touch) |
| Word / letter reveal      | `ui/RevealText.tsx`                         |
| Fade-up on scroll         | `ui/FadeIn.tsx`                             |
| Infinite ticker           | `ui/Marquee.tsx` (slows on hover)           |
| Tilted cards straighten   | `ui/TiltCard.tsx` (on scroll and hover)     |
| Accordion                 | `ui/Accordion.tsx`                          |

All motion respects `prefers-reduced-motion`.

## Part 6: Admin Dashboard
The admin dashboard allows managing projects, services, testimonials, and contact inquiries.

### Setup
1. **Backend:**
   Ensure the backend is running on port 8001:
   ```bash
   cd backend
   .\venv\Scripts\Activate
   uvicorn app.main:app --host 127.0.0.1 --port 8001
   ```

2. **Frontend:**
   Create a `.env.local` file in the frontend root based on `.env.local.example`:
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8001
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```

### Admin Access
- **URL:** `http://localhost:3000/admin`
- **Login:** Use the admin username and password set in your `backend/.env` file (`ADMIN_USERNAME` and `ADMIN_PASSWORD`). Choose your own strong password and never commit `.env`.
