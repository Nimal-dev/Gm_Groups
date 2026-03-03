'use client';

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import gm_logo from "../../../public/gm_logo_dark.png";

export function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -20]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-32 relative overflow-hidden bg-[#0a0a0a]"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] -mr-64 -mt-32" />

      <div className="container px-4 mx-auto relative z-10">
        <div className="grid items-center gap-16 lg:grid-cols-2">

          <motion.div
            style={{ y: textY }}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-primary font-black tracking-widest text-sm uppercase px-4 py-1 border-l-2 border-primary"
              >
                Our Legacy
              </motion.span>
              <h2 className="text-3xl sm:text-4xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
                <span className="text-white">THE HISTORY OF</span><br />
                <span className="text-zinc-600">DOMINATION</span>
              </h2>
            </div>

            <div className="glass-pane p-5 md:p-12 space-y-6 relative group overflow-hidden">
              {/* Animated Border Glow */}
              <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/20 transition-colors duration-500" />

              <p className="text-base md:text-xl text-zinc-300 leading-relaxed font-light">
                GM Groups Pvt Ltd stands as the most dominant Roleplay club on the <span className="text-primary font-bold">Xlantis</span> server. Our roots run deep in the city's underbelly and its high-flying corporate world.
              </p>
              <p className="text-base md:text-xl text-zinc-400 leading-relaxed font-light italic">
                "We are more than a crew; we are a family bound by a legacy of strategic business, and unwavering loyalty."
              </p>

              <div className="pt-6 flex items-center justify-between md:justify-start gap-4 md:gap-8">
                <div className="flex flex-col">
                  <span className="text-white font-black text-2xl md:text-3xl">100%</span>
                  <span className="text-zinc-500 text-[10px] md:text-xs uppercase tracking-widest">Loyalty</span>
                </div>
                <div className="w-px h-10 bg-zinc-800" />
                <div className="flex flex-col">
                  <span className="text-white font-black text-2xl md:text-3xl">24/7</span>
                  <span className="text-zinc-500 text-[10px] md:text-xs uppercase tracking-widest">Active</span>
                </div>
                <div className="w-px h-10 bg-zinc-800" />
                <div className="flex flex-col">
                  <span className="text-white font-black text-2xl md:text-3xl">TOP</span>
                  <span className="text-zinc-500 text-[10px] md:text-xs uppercase tracking-widest">Business</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            style={{ y: imageY }}
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative"
          >
            {/* Image Frame with Glass Effect */}
            <div className="relative z-10 p-4 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl skew-y-[-2deg]">
              <Image
                src={gm_logo}
                alt="GM_Logo"
                width={800}
                height={600}
                className="object-cover w-full h-auto grayscale hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
              />
              {/* Inner Glow Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none" />
            </div>

            {/* Background Glow for Image */}
            <div className="absolute -inset-10 bg-primary/10 blur-[100px] rounded-full -z-10 animate-pulse-glow" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
