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

      <div className="absolute inset-0 bg-black/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-black/50 to-background/90" />

      <div className="container relative z-10 px-4 mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
            className="text-left"
          >
            <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-accent uppercase border border-accent/20 rounded-full bg-accent/10 backdrop-blur-md">
              Official Front
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight uppercase text-white mb-6">
              <span className="text-primary block">Burgershot</span>
              <span className="text-2xl md:text-3xl font-light tracking-widest block mt-2 opacity-80">Heart of Operations</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
              More than just a fast-food joint, Burgershot is a hub of information, a neutral ground for meetings, and a symbol of our public-facing dominance. It's the jewel in our commercial crown.
            </p>

            <Button asChild size="lg" className="px-8 py-6 text-lg font-bold bg-primary text-black neon-button hover:bg-white rounded-full transition-all duration-300">
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
            <div className="relative p-8 border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl max-w-md text-center transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <blockquote className="text-3xl italic font-serif text-white">
                &ldquo;Where crime meets cuisine.&rdquo;
              </blockquote>
              <div className="mt-4 text-sm text-accent tracking-widest uppercase">- The Motto</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
