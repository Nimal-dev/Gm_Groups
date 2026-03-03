'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import gm_wp from "../../../public/gm_wallpaper.jpg";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.1]);

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative flex items-center justify-center w-full min-h-screen overflow-hidden bg-black"
    >
      {/* Cinematic Background with Parallax */}
      <motion.div
        style={{ y: y1, scale }}
        className="absolute inset-0 z-0"
      >
        <Image
          src={gm_wp}
          alt="GM Groups Cinematic Background"
          fill
          priority
          className="object-cover object-center opacity-60 brightness-[0.4] contrast-[1.2]"
          sizes="100vw"
        />
      </motion.div>

      {/* Layered Overlays for Depth */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-black/20 to-[#0a0a0a]" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/80 via-transparent to-black/80" />

      {/* Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full z-[1]" />

      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center pt-32 md:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <span className="text-[10px] md:text-xs font-bold tracking-[0.4em] text-primary uppercase bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 backdrop-blur-md">
            EST. 2024 • THE LEGACY
          </span>
        </motion.div>

        <div className="overflow-hidden mb-6">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="text-5xl md:text-8xl lg:text-[10rem] font-black tracking-tighter uppercase leading-[0.8] text-center"
          >
            <span className="block text-white">THE EMPIRE OF</span>
            <span className="block text-primary drop-shadow-[0_0_30px_rgba(250,204,21,0.4)]">GM GROUPS</span>
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-2xl text-lg md:text-xl text-zinc-400 text-center mb-12 leading-relaxed"
        >
          Dominating the streets of Xlantis with unmatched power, strategic business, and a bond forged in loyalty. Experience the pinnacle of roleplay excellence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <Button
            asChild
            size="lg"
            className="h-16 px-10 text-lg font-black bg-primary hover:bg-white text-black rounded-none skew-x-[-12deg] transition-all duration-300 group"
          >
            <Link href="/apply" className="flex items-center gap-2">
              <span className="skew-x-[12deg]">APPLY HERE</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-16 px-10 text-lg font-bold border-white/10 hover:border-primary bg-white/5 backdrop-blur-md text-white hover:text-black rounded-none skew-x-[-12deg] transition-all duration-300"
          >
            <Link href="#about">
              <span className="skew-x-[12deg]">EXPLORE LEGACY</span>
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Floating Scroll Indicator */}
      <motion.div
        style={{ opacity }}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-12 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Scroll to Discover</span>
        <ChevronDown className="w-6 h-6 text-primary" />
      </motion.div>
    </section>
  );
}
