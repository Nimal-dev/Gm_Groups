'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animation-utils";

import bs from "../../../public/bs.png"

export function BusinessSection() {
  return (
    <section
      id="business"
      className="relative py-32 sm:py-48 flex items-center justify-center overflow-hidden"
    >
      {/* Parallax Background */}
      <div
        className="absolute inset-0 bg-center bg-cover bg-fixed transform scale-110"
        style={{ backgroundImage: `url(${bs.src})` }}
      />

      <div className="absolute inset-0 bg-[#ffd700]/10 backdrop-blur-lg" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/90 mix-blend-multiply" />

      <div className="container relative z-10 px-4 mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
            className="text-left"
          >
            <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-[#ffd700] uppercase border border-[#ffd700]/30 rounded-full bg-black/50 backdrop-blur-md shadow-[0_0_10px_rgba(255,215,0,0.1)]">
              Official Front
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] to-[#ccaa00] block drop-shadow-xl">Burgershot</span>
              <span className="text-2xl md:text-3xl font-light tracking-widest block mt-2 text-gray-300">Heart of Operations</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
              More than just a fast-food joint, Burgershot is a hub of information, a neutral ground for meetings, and a symbol of our public-facing dominance. It's the jewel in our commercial crown.
            </p>

            <Button asChild size="lg" className="px-8 py-6 text-lg font-bold bg-[#ffd700] text-black shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:bg-[#ffe033] hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] rounded-full transition-all duration-300">
              <Link href="/burgershot">
                Explore Burgershot <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="relative hidden md:flex items-center justify-center"
          >
            <div className="relative p-8 border border-[#ffd700]/20 bg-black/40 backdrop-blur-xl rounded-2xl max-w-md text-center transform rotate-3 hover:rotate-0 transition-all duration-500 shadow-[0_0_40px_rgba(255,215,0,0.1)] hover:shadow-[0_0_50px_rgba(255,215,0,0.2)]">
              <blockquote className="text-3xl italic font-serif text-white">
                &ldquo;Where crime meets cuisine.&rdquo;
              </blockquote>
              <div className="mt-4 text-sm text-[#ffd700] tracking-widest uppercase font-bold">- The Motto</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
