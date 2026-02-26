'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { fadeIn, slideUp } from "@/lib/animation-utils";

import gm_logo from "../../../public/gm_logo_dark.png"

export function AboutSection() {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="container px-4 mx-auto relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-2">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">About</span> <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] to-[#ccaa00] drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">GM Groups</span>
            </h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                GM Groups Pvt Ltd stands as the most dominant Roleplay club on the Xlantis server. Our roots run deep in the city's underbelly and its high-flying corporate world. We are more than a crew; we are a family bound by a legacy of strategic business, and unwavering loyalty.
              </p>
              <p>
                Our influence extends to every corner of the city, most notably through our ownership of <span className="font-bold text-white">Burgershot</span> – the most loved and frequented fast-food spot in Xlantis. It's a testament to our public face, a symbol of our power to control both the streets and the spreadsheets.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <div className="h-1 w-20 bg-[#ffd700] rounded-full drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]" />
              <div className="h-1 w-10 bg-[#ffd700]/50 rounded-full" />
              <div className="h-1 w-4 bg-[#ffd700]/20 rounded-full" />
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="w-full flex justify-center lg:justify-end"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#ffd700]/40 to-[#e69b00]/20 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
              <Card className="relative overflow-hidden border-none bg-black/40 backdrop-blur-xl ring-1 ring-[#ffd700]/10 rounded-2xl shadow-[0_0_30px_rgba(255,215,0,0.05)] group-hover:shadow-[0_0_40px_rgba(255,215,0,0.15)] transition-all">
                <CardContent className="p-0">
                  <Image
                    src={gm_logo}
                    alt="GM_Logo"
                    width={600}
                    height={400}
                    className="object-cover w-full h-auto opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                  />
                </CardContent>
              </Card>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
