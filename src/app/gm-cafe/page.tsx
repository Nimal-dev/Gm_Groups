'use client';

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MenuSection } from "@/components/sections/menu-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { motion } from "framer-motion";
import Image from "next/image";
import gmcafe_bg from "../../../public/gmcafe_bg.png";

export default function GMCafePage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header />

      <main className="flex-grow">
        {/* Hero Section for GM Cafe */}
        <section className="relative h-[100vh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src={gmcafe_bg}
              alt="GM Cafe Flagship Restaurant"
              fill
              priority
              className="object-cover opacity-75 brightness-[0.55]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/25 to-[#050505]" />
          </div>

          {/* Decorative Subtle English Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
            <span className="text-[18vw] font-black text-[#D4AF37] opacity-[0.03] whitespace-nowrap select-none tracking-tighter" style={{ transform: 'rotate(-3deg)' }}>
              GM CAFE
            </span>
          </div>

          <div className="container px-4 mx-auto relative z-10 text-center flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="h-[1px] w-8 bg-[#D4AF37]" />
              <span className="text-[#D4AF37] tracking-[0.4em] uppercase text-sm font-semibold">
                Premium Dining & Lounge
              </span>
              <div className="h-[1px] w-8 bg-[#D4AF37]" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-7xl md:text-9xl font-black tracking-tighter uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2B2] via-[#D4AF37] to-[#AA8222] filter drop-shadow-[0_5px_5px_rgba(0,0,0,1)]"
            >
              GM <span className="text-white">CAFE</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl font-light leading-relaxed mb-6"
            >
              Exquisite culinary craftsmanship and modern luxury at **GM Cafe & Restaurant**.
              Taste the prestige of GM Groups through our handcrafted gourmet menu.
            </motion.p>
          </div>
        </section>

        <div className="relative bg-[#050505]">
          <div className="absolute top-0 left-0 w-full h-full bg-[#D4AF37]/5 blur-[120px] pointer-events-none" />
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
          <MenuSection />
          <GallerySection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
