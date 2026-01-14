'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
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
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat bg-fixed transform scale-105"
        style={{ backgroundImage: `url(${gm_wp.src})` }}
      />

      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />

      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="text-xl md:text-2xl font-light tracking-[0.5em] text-accent uppercase">
            Welcome to Xlantis
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight uppercase font-headline mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 drop-shadow-lg"
        >
          GM Groups
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed"
        >
          Dominating the streets with style, power, and unity. <br />
          <span className="text-white italic">"The city never sleeps. Neither do we."</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button asChild size="lg" className="px-8 py-6 text-lg font-bold bg-accent text-white neon-button rounded-full">
            <Link href="#join">Enlist Now</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg border-white/20 hover:bg-white/10 text-white rounded-full">
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
          <ArrowDown className="w-8 h-8 text-white" />
        </Link>
      </motion.div>
    </section>
  );
}
