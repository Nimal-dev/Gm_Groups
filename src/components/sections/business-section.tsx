'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import bs from "../../../public/koicafe_bg.png"

export function BusinessSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section
      ref={containerRef}
      id="business"
      className="relative py-48 flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Heavy Parallax Background */}
      <motion.div
        style={{ y: bgY, backgroundImage: `url(${bs.src})` }}
        className="absolute inset-0 bg-center bg-cover grayscale opacity-30"
      />
      <div
        className="absolute inset-0 bg-center bg-cover bg-fixed opacity-10 pointer-events-none"
        style={{ backgroundImage: `url(${bs.src})` }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-[1]" />
      <div className="absolute inset-0 bg-[#27cb63]/5 mix-blend-color z-[1]" />

      <div className="container relative z-10 px-4 mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <span className="text-[#27cb63] font-black tracking-[0.4em] text-xs uppercase bg-[#27cb63]/10 px-4 py-1.5 rounded-none border-l-4 border-[#27cb63]">
                The Flagship Front
              </span>
              <h2 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8]">
                <span className="text-white">KOI</span><br />
                <span className="text-[#27cb63]">CAFE</span>
              </h2>
            </div>

            <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed max-w-xl">
              More than just a fast-food joint, KOI Cafe is a hub of information, a neutral ground for meetings, and a symbol of our public-facing dominance. It's the jewel in our commercial crown that keeps the city fed and our secrets safe.
            </p>

            <Button
              asChild
              size="lg"
              className="h-14 md:h-16 px-8 md:px-10 text-base md:text-lg font-black bg-[#27cb63] hover:bg-white text-black rounded-none skew-x-[-12deg] transition-all duration-300 group"
            >
              <Link href="/koi-cafe" className="flex items-center gap-3">
                <span className="skew-x-[12deg]">DOMINATE CUISINE</span>
                <ArrowRight className="w-5 h-5 skew-x-[12deg] group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="glass-pane p-8 md:p-20 relative overflow-hidden group">
              {/* Inner Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#27cb63]/10 blur-[60px] -mr-16 -mt-16 group-hover:bg-[#27cb63]/20 transition-colors" />

              <p className="text-2xl md:text-5xl font-black italic text-white leading-tight uppercase tracking-tighter mb-6">
                "Where crime meets cuisine."
              </p>
              <div className="flex items-center gap-4">
                <div className="h-0.5 w-12 bg-[#27cb63]" />
                <span className="text-[#27cb63] font-bold tracking-widest uppercase text-xs">The Official Motto</span>
              </div>
            </div>

            {/* Background Accent */}
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[#27cb63]/10 blur-[100px] rounded-full -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
