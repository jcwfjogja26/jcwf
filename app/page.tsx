import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import ActivitiesSection from "@/components/home/ActivitiesSection";
import JourneySection from "@/components/home/JourneySection";
import MarketplaceSection from "@/components/home/MarketplaceSection";
import PassportSection from "@/components/home/PassportSection";
import GallerySection from "@/components/home/GallerySection";
import FaqSection from "@/components/home/FaqSection";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ActivitiesSection />
      <JourneySection />
      <MarketplaceSection />
      <PassportSection />
      <GallerySection />
      <FaqSection />
      <Footer />
    </main>
  );
}