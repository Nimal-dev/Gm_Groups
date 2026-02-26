
'use client';

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";

import bs_shop from "../../../public/bs.png"
import gmxtokyo from "../../../public/GMxTKY_site.png"
import kitchen from "../../../public/kitchen.png"

const menuItems = {
  burgers: [
    { name: "Steahouse Supreme Burger", price: "$50,000", description: "Our signature classic. A mix of juicy chicken, bacon and steak patty, special sauce, lettuce, cheese, pickles, onions, ketchup on a sesame seed bun." },
    { name: "Ocean Catch Burger", price: "$50,000", description: "Our new seafood burger. Fresh from the ocean the burger is infused in fried fish patty and cheese and the delicacy is delicious!!" },
    { name: "The Cardiac Crusher", price: "$50,000", description: "OReady to stop your hearts! Introducing the new big burger with 3 beef pattys that can finish your hunger in a gif." },
    { name: "Sunrise Ham Melt Sandwich", price: "$25,000", description: "Double cheese, ham, and a fried egg. Not for the faint of heart." },


  ],
  sides: [
    { name: " Fries", price: "$25,000", description: "Crispy, salty, and perfect for sharing. Or not." },

  ],
  drinks: [
    { name: "E-Cola", price: "$50,000", description: "The classic taste of virtual refreshment." },
    { name: "Sprunk", price: "$50,000", description: "For when you need that extra green kick." },

  ],
};

import image1 from "../../../public/1.png";
import image2 from "../../../public/2.png";
import image3 from "../../../public/3.png";
import image4 from "../../../public/bsoffice.png";

const ambianceImages = [
  { src: image1, alt: "Burgershot interior view 1", hint: "diner interior night" },
  { src: image2, alt: "Burgershot interior view 2", hint: "retro diner booth" },
  { src: image3, alt: "Burgershot exterior view ", hint: "drive thru" },
  { src: image4, alt: "Burgershot interior view 4", hint: "neon sign food" },
];

export default function BurgershotPage() {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <section
          className="relative py-40 text-white bg-center bg-cover bg-fixed sm:py-60"
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
              className="text-6xl md:text-8xl lg:text-[11rem] font-black tracking-tighter uppercase leading-none drop-shadow-2xl"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">BURGER</span><span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ff8c00] to-[#cc5200]">SHOT</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto mt-6 text-2xl md:text-3xl italic text-gray-300 font-headline font-light"
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
              className="max-w-4xl mx-auto text-center p-10 md:p-14 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(255,140,0,0.1)] relative overflow-hidden"
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
                className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-6"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">MEET OUR</span> <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ff8c00] to-[#cc5200]">INVESTORS</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                className="max-w-2xl mx-auto text-lg md:text-xl font-light text-gray-300 leading-relaxed"
              >
                At GM Groups, we take pride in our ventures—and none more than our beloved Burgershot outlet. This dream wouldn’t have been possible without the unwavering support of our sole investor, the <span className="text-white font-semibold">Tokyo Family</span>. Their full financial backing brought our vision to life, helping us serve great taste with unmatched passion. This is a joint venture between GM x TOKYO.
              </motion.p>
            </motion.div>
          </div>
        </section>
        {/* The ambiance section */}
        <section id="about" className="py-24 sm:py-32 bg-[#050505] text-white">
          <div className="container px-4 mx-auto max-w-6xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="p-8 md:p-10 rounded-2xl bg-[#0f0f0f]/80 backdrop-blur-md border border-white/5 shadow-lg relative"
              >
                {/* Accent line */}
                <div className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-gradient-to-b from-transparent via-[#ff8c00] to-transparent opacity-70" />

                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-6">
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">OUR</span> <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ff8c00] to-[#cc5200]">AMBIANCE</span>
                </h2>
                <p className="text-lg md:text-xl font-light text-gray-400 leading-relaxed">
                  Step into a classic American diner with a modern, chaotic twist. Our interior is a carefully crafted blend of retro charm and urban grit, providing the perfect backdrop for business deals, casual meetups, or a quick escape. The neon glow, the checkered floors, and the smell of freedom (and fries) make Burgershot an unforgettable Xlantis landmark.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-tr from-[#ff8c00]/30 to-purple-500/10 rounded-2xl blur-xl opacity-50 mix-blend-screen" />
                <Card className="relative overflow-hidden border border-white/10 rounded-2xl bg-black/60 backdrop-blur-sm">
                  <Carousel
                    plugins={[plugin.current]}
                    className="w-full"
                    onMouseEnter={plugin.current.stop}
                    onMouseLeave={plugin.current.reset}
                    opts={{
                      loop: true,
                      align: 'start',
                      skipSnaps: false,
                    }}
                  >
                    <CarouselContent>
                      {ambianceImages.map((image, index) => (
                        <CarouselItem key={index}>
                          <div className="relative aspect-[4/3] w-full">
                            <Image
                              src={image.src}
                              alt={image.alt}
                              fill
                              className="object-cover transition-transform duration-700 ease-in-out hover:scale-105"
                              data-ai-hint={image.hint}
                            />
                            {/* Glass overlay on image bottom */}
                            <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/80 to-transparent" />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
        {/* The Kitchen section */}
        <section id="kitchen" className="py-24 sm:py-32 bg-black text-white relative border-t border-white/5">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#ff8c00]/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="container px-4 mx-auto max-w-6xl relative z-10">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative lg:order-last p-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#ff8c00]/20 to-transparent rounded-2xl blur-md" />
                <Card className="relative overflow-hidden border border-white/10 rounded-2xl bg-[#0f0f0f]">
                  <div className="aspect-[4/3] w-full relative">
                    <Image
                      src={kitchen}
                      alt="Burgershot kitchen"
                      fill
                      className="object-cover"
                      data-ai-hint="restaurant kitchen action"
                    />
                    <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none" />
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="p-8 md:p-10 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/5 shadow-2xl relative lg:order-first"
              >
                {/* Accent line */}
                <div className="absolute right-0 top-1/4 bottom-1/4 w-[3px] bg-gradient-to-b from-transparent via-[#ff8c00] to-transparent opacity-70" />

                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-6">
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">THE</span> <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ff8c00] to-[#cc5200]">ENGINE ROOM</span>
                </h2>
                <p className="text-lg md:text-xl font-light text-gray-400 leading-relaxed">
                  This is where the magic happens. Our state-of-the-art kitchen is a well-oiled machine, churning out the city's favorite burgers with ruthless efficiency. We maintain the highest standards of cleanliness and quality, because even in a world of crime, we believe in a good, clean burger.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="menu" className="py-24 sm:py-32 bg-black text-white">
          <div className="container px-4 mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="flex items-center justify-center gap-4 mb-4"
              >
                <div className="w-12 h-[1px] bg-[#ff8c00]" />
                <span className="text-sm font-bold tracking-[0.2em] text-[#ff8c00] uppercase">The Offerings</span>
                <div className="w-12 h-[1px] bg-[#ff8c00]" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-6xl md:text-8xl font-black tracking-tighter uppercase"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">OUR</span> <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ff8c00] to-[#cc5200]">MENU</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="max-w-2xl mx-auto mt-6 text-xl md:text-2xl font-light italic text-gray-400"
              >
                Simple, iconic, and dangerously good.
              </motion.p>
            </div>

            {/* Menu Layout */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="grid gap-12 md:grid-cols-2 md:gap-16 pt-8"
            >
              {/* Left Column: Burgers */}
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <h3 className="text-3xl font-black uppercase tracking-tight text-white">Burgers</h3>
                  <div className="h-[2px] bg-[#ff8c00] flex-grow opacity-50" />
                </div>
                <div className="space-y-6">
                  {menuItems.burgers.map((item) => (
                    <div key={item.name} className="p-6 rounded-xl bg-[#0f0f0f] border border-white/5 hover:border-[#ff8c00]/30 transition-colors">
                      <div className="flex items-baseline justify-between w-full mb-3">
                        <span className="text-lg font-bold text-white uppercase tracking-wide">{item.name}</span>
                        <div className="flex-grow mx-4 border-b border-dotted border-gray-600/50" />
                        <span className="text-lg font-bold text-[#ff8c00]">{item.price}</span>
                      </div>
                      <p className="text-sm text-gray-400 font-light leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Sides & Drinks */}
              <div className="space-y-12">
                {/* Sides */}
                <div>
                  <div className="flex items-center gap-4 mb-8">
                    <h3 className="text-3xl font-black uppercase tracking-tight text-white">Sides</h3>
                    <div className="h-[2px] bg-[#ff8c00] flex-grow opacity-50" />
                  </div>
                  <div className="space-y-6">
                    {menuItems.sides.map((item) => (
                      <div key={item.name} className="p-6 rounded-xl bg-[#0f0f0f] border border-white/5 hover:border-[#ff8c00]/30 transition-colors">
                        <div className="flex items-baseline justify-between w-full mb-3">
                          <span className="text-lg font-bold text-white uppercase tracking-wide">{item.name}</span>
                          <div className="flex-grow mx-4 border-b border-dotted border-gray-600/50" />
                          <span className="text-lg font-bold text-[#ff8c00]">{item.price}</span>
                        </div>
                        <p className="text-sm text-gray-400 font-light leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Drinks */}
                <div>
                  <div className="flex items-center gap-4 mb-8">
                    <h3 className="text-3xl font-black uppercase tracking-tight text-white">Drinks</h3>
                    <div className="h-[2px] bg-[#ff8c00] flex-grow opacity-50" />
                  </div>
                  <div className="space-y-6">
                    {menuItems.drinks.map((item) => (
                      <div key={item.name} className="p-6 rounded-xl bg-[#0f0f0f] border border-white/5 hover:border-[#ff8c00]/30 transition-colors">
                        <div className="flex items-baseline justify-between w-full mb-3">
                          <span className="text-lg font-bold text-white uppercase tracking-wide">{item.name}</span>
                          <div className="flex-grow mx-4 border-b border-dotted border-gray-600/50" />
                          <span className="text-lg font-bold text-[#ff8c00]">{item.price}</span>
                        </div>
                        <p className="text-sm text-gray-400 font-light leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
