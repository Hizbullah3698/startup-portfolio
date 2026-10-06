import { FloatingContact } from "@/components/layout/FloatingContact";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { About } from "@/components/sections/About";
import { Faq } from "@/components/sections/Faq";
import { FeaturedQuote } from "@/components/sections/FeaturedQuote";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Services } from "@/components/sections/Services";
import { Testimonials } from "@/components/sections/Testimonials";
import { TrustStrip } from "@/components/sections/TrustStrip";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <Projects />
        <FeaturedQuote />
        <Services />
        <About />
        <Testimonials />
        <Faq />
      </main>
      <Footer />
      <FloatingContact />
    </>
  );
}
