import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import ReelsPreview from "@/components/landing/ReelsPreview";
import ShowcaseGallery from "@/components/landing/ShowcaseGallery";
import Reviews from "@/components/landing/Reviews";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";
import InstallBanner from "@/components/InstallBanner";

export default function Landing() {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) {
      base44.functions.invoke("process-referral", {
        action: "track_click",
        referral_code: ref,
        source: "landing",
      }).catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <ShowcaseGallery />
        <Features />
        <HowItWorks />
        <ReelsPreview />
        <Reviews />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <InstallBanner />
    </div>
  );
}