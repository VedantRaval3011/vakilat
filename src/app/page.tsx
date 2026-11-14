import { Cta } from "@/components/landing/Cta";
import { Faq } from "@/components/landing/Faq";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { JournalCarousel } from "@/components/landing/JournalCarousel";
import { Stats } from "@/components/landing/Stats";
import { Testimonials } from "@/components/landing/Testimonials";
import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Stats />
        <Features />
        <Testimonials />
        <JournalCarousel />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
