import { Header } from '@/components/header';
import { AboutSection } from '@/components/sections/about-section';
import { BusinessSection } from '@/components/sections/business-section';
import { HeroSection } from '@/components/sections/hero-section';
import { JoinUsSection } from '@/components/sections/join-us-section';
import { PillarsSection } from '@/components/sections/pillars-section';
import { Footer } from '@/components/footer';
import { BurgershotCTA } from '@/components/sections/burgershot-cta';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <PillarsSection />
        <BusinessSection />
        <BurgershotCTA />
        <JoinUsSection />
      </main>
      <Footer />
    </div>
  );
}
