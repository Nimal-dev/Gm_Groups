'use client';

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MenuSection } from "@/components/sections/menu-section";
import { DetailedMenu } from "@/components/sections/detailed-menu";
import { GallerySection } from "@/components/sections/gallery-section";
import { KOICafeCTA } from "@/components/sections/burgershot-cta";
import { motion } from "framer-motion";
import Image from "next/image";
import koi_bg from "../../../public/koicafe_bg.png";

export default function KOICafePage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header />

      <main className="flex-grow">
        {/* Hero-like intro for the page */}
        <section className="relative h-[100vh] flex items-center justify-center overflow-hidden">
          {/* Background Image with Parallax-ready styling */}
          <div className="absolute inset-0 z-0">
            <Image
              src={koi_bg}
              alt="KOI Cafe Background"
              fill
              priority
              className="object-cover opacity-60 brightness-[0.4]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
          </div>

          <div className="container px-4 mx-auto relative z-10 text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#27cb63] font-bold tracking-[0.3em] uppercase text-xs mb-4 block"
            >
              Premium Dining
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-8xl font-black tracking-tighter uppercase mb-6"
            >
              KOI <span className="text-[#27cb63]">CAFE</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl font-light leading-relaxed"
            >
              Exquisite Japanese flavors meeting modern culinary innovation.
              Taste the heritage of GM Groups through our signature dishes.
            </motion.p>
          </div>
        </section>

        <div className="relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[#27cb63]/5 blur-[120px] pointer-events-none" />
          <MenuSection />
          <DetailedMenu />
          <GallerySection />
          {/* <KOICafeCTA /> */}
        </div>
      </main>

      <Footer />
    </div>
  );
}
