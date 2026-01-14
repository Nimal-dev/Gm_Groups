'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fadeIn, staggerContainer, slideUp } from "@/lib/animation-utils";

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
    <section id="pillars" className="py-24 relative overflow-hidden">
      {/* Background ambience */}
      <div className="absolute inset-0 bg-background/95 -z-10" />
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-accent/5 rounded-full blur-[100px] -z-10" />

      <div className="container px-4 mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight uppercase font-headline mb-4">
            Our <span className="text-accent drop-shadow-neon">Pillars</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Three core members form the foundation of our power.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-8 md:grid-cols-3"
        >
          {pillars.map((pillar, index) => (
            <motion.div key={pillar.name} variants={slideUp} >
              <Card className="h-full border-none bg-white/5 backdrop-blur-sm border border-white/10 hover:border-accent/50 transition-colors duration-500 group overflow-hidden">
                <CardHeader className="p-0 overflow-hidden">
                  <div className="relative h-[400px] w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-10 opactiy-60 group-hover:opacity-40 transition-opacity" />
                    <Image
                      src={pillar.image}
                      alt={pillar.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-6 relative z-20 -mt-20">
                  <CardTitle className="text-2xl font-bold uppercase text-white mb-2">{pillar.name}</CardTitle>
                  <p className="text-sm font-semibold tracking-widest text-accent mb-4">{pillar.title}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed text-white/80">
                    {pillar.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
