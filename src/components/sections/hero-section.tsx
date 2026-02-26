'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import gm_wp from "../../../public/gm_wallpaper.jpg";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex items-center justify-center w-full min-h-screen overflow-hidden text-white"
    >
      {/* Background Image with Parallax Effect could be added here, for now static fixed */}
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0">
        <Image
          src={gm_wp}
          alt="GM Groups Wallpaper"
          fill
          priority
          className="object-cover object-center transform scale-105"
          sizes="100vw"
        />
      </div>

      {/* Cinematic Gradient Overlays with Golden Glassmorphism */}
      <div className="absolute inset-0 bg-[#ffd700]/10 backdrop-blur-md" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />

      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="text-xl md:text-2xl font-bold tracking-[0.5em] text-[#ffd700] uppercase drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] px-6 py-2 border border-[#ffd700]/30 rounded-full bg-black/40 backdrop-blur-md">
            Welcome to
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase mb-6 drop-shadow-2xl"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">GM</span> <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] to-[#b38f00]">GROUPS</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="max-w-2xl text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed font-light backdrop-blur-sm bg-black/20 p-4 rounded-xl border border-white/5"
        >
          Dominating the streets with style, power, and unity. <br />
          <span className="text-white italic text-shadow-sm font-medium">"The city never sleeps. Neither do we."</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <Button asChild size="lg" className="px-8 py-6 text-lg font-bold bg-[#ffd700] hover:bg-[#ffe033] text-black shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] rounded-full transition-all">
            <Link href="/apply">Apply Now</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg border-[#ffd700]/30 hover:border-[#ffd700] hover:bg-black/60 bg-black/40 backdrop-blur-md text-[#ffd700] rounded-full transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <Link href="#about">Learn More</Link>
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce"
      >
        <Link href="#about" aria-label="Scroll down" className="opacity-70 hover:opacity-100 transition-opacity">
          <ArrowDown className="w-8 h-8 text-[#ffd700] drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]" />
        </Link>
      </motion.div>
    </section>
  );
}
