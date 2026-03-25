'use client';

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MenuSection } from "@/components/sections/menu-section";
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
              className="object-cover opacity-60 brightness-[0.3]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-[#050505]" />
          </div>

          {/* Large Japanese Background Watermarks */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
            <span className="text-[20vw] font-serif text-[#D4AF37] opacity-[0.03] whitespace-nowrap select-none font-bold" style={{ transform: 'rotate(-5deg)' }}>
              和風庭園
            </span>
          </div>
          <div className="absolute right-10 top-1/4 pointer-events-none opacity-10 z-0">
             <span className="text-8xl font-serif text-[#D4AF37] writing-mode-vertical whitespace-nowrap select-none" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                厳選された食材
             </span>
          </div>
          <div className="absolute left-10 bottom-1/4 pointer-events-none opacity-10 z-0">
             <span className="text-8xl font-serif text-[#D4AF37] writing-mode-vertical whitespace-nowrap select-none" style={{ writingMode: 'vertical-rl' }}>
                至福のひととき
             </span>
          </div>

          <div className="container px-4 mx-auto relative z-10 text-center flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="h-[1px] w-8 bg-[#D4AF37]" />
              <span className="text-[#D4AF37] font-serif tracking-[0.4em] uppercase text-sm">
                Premium Dining
              </span>
              <div className="h-[1px] w-8 bg-[#D4AF37]" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-7xl md:text-9xl font-black tracking-tighter uppercase mb-2 text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2B2] via-[#D4AF37] to-[#AA8222] filter drop-shadow-[0_5px_5px_rgba(0,0,0,1)]"
            >
              KOI <span className="text-white">CAFE</span>
            </motion.h1>
            
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.3 }}
               className="text-[#D4AF37] text-2xl font-serif tracking-widest mb-8"
            >
              コイカフェ
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl font-light leading-relaxed"
            >
              Exquisite Japanese flavors meeting modern culinary innovation at **GM Cafe & Restaurant**.
              Taste the heritage of GM Groups through our signature dishes.
            </motion.p>
          </div>
        </section>

        <div className="relative bg-[#050505]">
          <div className="absolute top-0 left-0 w-full h-full bg-[#D4AF37]/5 blur-[120px] pointer-events-none" />
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
          <MenuSection />
          <GallerySection />
          {/* <KOICafeCTA /> */}
        </div>
      </main>

      <Footer />
    </div>
  );
}
