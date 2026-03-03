
'use client';

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { DetailedMenu } from "@/components/sections/detailed-menu";
import { GallerySection } from "@/components/sections/gallery-section";
import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

import bs_shop from "../../../public/bs.png"
import gmxtokyo from "../../../public/GMxTKY_site.png"

export default function BurgershotPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <section
          className="relative py-24 text-white bg-center bg-cover bg-fixed sm:py-60"
        >
          <Image
            src={bs_shop}
            alt="Burgershot Shop"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/70" />
          <div className="container relative z-10 px-4 mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-8 flex justify-center"
            >
              <span className="px-6 py-2 text-sm md:text-base font-bold tracking-[0.2em] text-[#ff8c00] uppercase border border-[#ff8c00]/50 rounded-full bg-black/50 backdrop-blur-sm">
                GM Groups
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-5xl md:text-8xl lg:text-[11rem] font-black tracking-tighter uppercase leading-none drop-shadow-2xl"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">BURGER</span><span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ff8c00] to-[#cc5200]">SHOT</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto mt-6 text-xl md:text-3xl italic text-gray-300 font-headline font-light"
            >
              &ldquo;The Taste of Freedom and <span className="text-[#ff8c00]">Profit.</span>&rdquo;
            </motion.p>
          </div>
        </section>

        {/* INVESTORS SECTION */}
        <section
          id="business"
          className="relative py-32 text-white bg-center bg-cover bg-fixed sm:py-48"
        >
          <Image
            src={gmxtokyo}
            alt="GM x Tokyo"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" />
          <div className="container relative z-10 px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center p-6 md:p-14 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(255,140,0,0.1)] relative overflow-hidden"
            >
              {/* Subtle top border glow */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff8c00] to-transparent opacity-50" />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
                className="flex items-center justify-center gap-4 mb-6"
              >
                <div className="w-12 h-[1px] bg-[#ff8c00]" />
                <span className="text-xs md:text-sm font-bold tracking-[0.2em] text-[#ff8c00] uppercase">The Partners</span>
                <div className="w-12 h-[1px] bg-[#ff8c00]" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-3xl md:text-6xl font-black tracking-tighter uppercase mb-6"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">MEET OUR</span> <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ff8c00] to-[#cc5200]">INVESTORS</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                className="max-w-2xl mx-auto text-base md:text-xl font-light text-gray-300 leading-relaxed"
              >
                At GM Groups, we take pride in our ventures—and none more than our beloved Burgershot outlet. This dream wouldn’t have been possible without the unwavering support of our sole investor, the <span className="text-white font-semibold">Tokyo Family</span>. Their full financial backing brought our vision to life, helping us serve great taste with unmatched passion. This is a joint venture between GM x TOKYO.
              </motion.p>
            </motion.div>
          </div>
        </section>
        {/* Detailed Menu Section */}
        <DetailedMenu />



        {/* Cinematic Showcase Section */}
        <GallerySection />

      </main>
      <Footer />
    </div>
  );
}
