import dynamic from 'next/dynamic';
import { Header } from '@/components/header';
import { AboutSection } from '@/components/sections/about-section';
import { HeroSection } from '@/components/sections/hero-section';
import { Footer } from '@/components/footer';
// import { BurgershotCTA } from '@/components/sections/burgershot-cta';

const PillarsSection = dynamic(() => import('@/components/sections/pillars-section').then(mod => mod.PillarsSection));
const BusinessSection = dynamic(() => import('@/components/sections/business-section').then(mod => mod.BusinessSection));
const JoinUsSection = dynamic(() => import('@/components/sections/join-us-section').then(mod => mod.JoinUsSection));

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <PillarsSection />
        <BusinessSection />
        {/* <BurgershotCTA /> */}
        <JoinUsSection />
      </main>
      <Footer />
    </div>
  );
}
