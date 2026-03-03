'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import gm from "../../../public/GM.png"
import ambaan from "../../../public/Ambaan.png"
import nimal from "../../../public/Nimal.png"

const pillars = [
  {
    name: "Nimal Prince",
    title: "The Manager",
    description: "The engine of our operations. The Manager ensures every deal is sealed, every asset is managed, and the gears of our enterprise turn smoothly.",
    image: nimal
  },
  {
    name: "Godwin memana",
    title: "The Boss",
    description: "The architect of our empire. With a mind for strategy and a vision that cuts through the chaos, The Boss guides our every move.",
    image: gm
  },
  {
    name: "Ambaan op",
    title: "The Legal Advisor",
    description: "The shadow navigates the treacherous waters of the law, ensuring our business remains untouchable.",
    image: ambaan
  }
];

export function PillarsSection() {
  return (
    <section id="pillars" className="py-32 relative overflow-hidden bg-black">
      {/* Decorative background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/2 opacity-20 blur-[120px] pointer-events-none" />

      <div className="container px-4 mx-auto relative z-10">
        <div className="flex flex-col mb-20">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-primary font-bold tracking-[0.3em] uppercase text-xs mb-4 px-4 border-l-2 border-primary"
          >
            The Foundation
          </motion.span>
          <h2 className="text-3xl sm:text-4xl md:text-7xl font-black tracking-tighter uppercase">
            <span className="text-white">CORE</span><br />
            <span className="text-zinc-800">LEADERSHIP</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group relative"
            >
              <div className="glass-pane p-4 h-full flex flex-col relative overflow-hidden">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg mb-8">
                  <Image
                    src={pillar.image}
                    alt={pillar.name}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 contrast-125"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                </div>

                <div className="space-y-4 relative z-10 flex-grow">
                  <div className="flex flex-col">
                    <span className="text-primary font-black tracking-widest text-[10px] uppercase mb-1">{pillar.title}</span>
                    <h3 className="text-3xl font-black uppercase text-white tracking-tighter">{pillar.name}</h3>
                  </div>
                  <p className="text-zinc-400 font-light leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                {/* Decorative Accent */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Background Glow */}
              <div className="absolute -inset-4 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
