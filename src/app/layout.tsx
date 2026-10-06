import type { Metadata, Viewport } from "next";
import { Inter, Permanent_Marker, Space_Grotesk } from "next/font/google";
import { site } from "@/data/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const permanentMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-permanent-marker",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.name} — Brand & UI/UX Designer`,
  description: site.description,
  openGraph: {
    title: `${site.name} — Brand & UI/UX Designer`,
    description: site.description,
    type: "website",
    images: ["/images/hero-character.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#111112",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${permanentMarker.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
