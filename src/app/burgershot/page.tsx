
'use client';

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const menuItems = {
  burgers: [
    { name: "Steahouse Supreme Burger", price: "$25,000", description: "Our signature classic. A juicy beef patty, special sauce, lettuce, cheese, pickles, onions on a sesame seed bun." },
    { name: "Sunrise Ham Melt Sandwich", price: "$11,000", description: "Double patty, double cheese, bacon, and a fried egg. Not for the faint of heart." },
   
  ],
  sides: [
    { name: " Fries", price: "$5,000", description: "Crispy, salty, and perfect for sharing. Or not." },
    
  ],
  drinks: [
    { name: "E-Cola", price: "$25,000", description: "The classic taste of virtual refreshment." },
    { name: "Sprunk", price: "$11,000", description: "For when you need that extra green kick." },
  ],
};

const ambianceImages = [
  { src: "https://cdn.discordapp.com/attachments/1402190606301794395/1402260583696437288/2.png?ex=6893446f&is=6891f2ef&hm=774df0da77b5fdec188a781e14f0a43752d6ead38149ea629aa155998e3281a0&", alt: "Burgershot interior view 1", hint: "diner interior night" },
  { src: "https://cdn.discordapp.com/attachments/1402190606301794395/1402261583383494707/ChatGPT_Image_Aug_5_2025_05_36_01_PM.png?ex=6893455e&is=6891f3de&hm=3d82ee560818871e597f5ebe9b99c53e8ba1cd2ed8d032a024f4d03f2002868e&", alt: "Burgershot interior view 2", hint: "retro diner booth" },
  { src: "https://placehold.co/600x400.png", alt: "Burgershot interior view 3", hint: "neon sign food" },
];

export default function BurgershotPage() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <section
          className="relative py-40 text-white bg-center bg-cover bg-fixed sm:py-60"
          style={{ backgroundImage: "url('https://cdn.discordapp.com/attachments/1402190606301794395/1402196301814169631/BS_1.png?ex=68930891&is=6891b711&hm=c292387f17da90d3f31bf96773162176462243db88ca2339276111741034a154&')" }}
          data-ai-hint="fast food restaurant interior"
        >
          <div className="absolute inset-0 bg-black/70" />
          <div className="container relative z-10 px-4 mx-auto text-center">
            <h1 className="text-5xl font-bold tracking-tight text-white uppercase font-headline md:text-7xl">
              Welcome to <span className="text-primary">Burgershot</span>
            </h1>
            <p className="max-w-3xl mx-auto mt-6 text-2xl italic text-accent font-headline">
              &ldquo;The Taste of Freedom and Profit.&rdquo;
            </p>
          </div>
        </section>

        <section id="about" className="py-24 sm:py-32">
          <div className="container px-4 mx-auto">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-4xl font-bold tracking-tight text-white uppercase font-headline md:text-5xl">
                  Our <span className="text-primary">Ambiance</span>
                </h2>
                <p className="mt-6 text-lg text-muted-foreground">
                  Step into a classic American diner with a modern, chaotic twist. Our interior is a carefully crafted blend of retro charm and urban grit, providing the perfect backdrop for business deals, casual meetups, or a quick escape. The neon glow, the checkered floors, and the smell of freedom (and fries) make Burgershot an unforgettable Xlantis landmark.
                </p>
              </div>
               <Card className="overflow-hidden border-2 neon-border">
                <Carousel
                  plugins={[plugin.current]}
                  className="w-full"
                  onMouseEnter={plugin.current.stop}
                  onMouseLeave={plugin.current.reset}
                >
                  <CarouselContent>
                    {ambianceImages.map((image, index) => (
                      <CarouselItem key={index} className="ken-burns-slide">
                          <Image
                            src={image.src}
                            alt={image.alt}
                            width={600}
                            height={400}
                            className="object-cover w-full h-auto"
                            data-ai-hint={image.hint}
                          />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </Card>
            </div>
          </div>
        </section>

        <section id="kitchen" className="py-24 bg-background/50 sm:py-32">
          <div className="container px-4 mx-auto">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <Card className="overflow-hidden border-2 neon-border lg:order-last">
                <Image
                  src="https://placehold.co/600x400.png"
                  alt="Burgershot kitchen"
                  width={600}
                  height={400}
                  className="object-cover w-full h-auto"
                  data-ai-hint="restaurant kitchen action"
                />
              </Card>
              <div className="lg:order-first">
                <h2 className="text-4xl font-bold tracking-tight text-white uppercase font-headline md:text-5xl">
                  The <span className="text-primary">Engine Room</span>
                </h2>
                <p className="mt-6 text-lg text-muted-foreground">
                  This is where the magic happens. Our state-of-the-art kitchen is a well-oiled machine, churning out the city's favorite burgers with ruthless efficiency. We maintain the highest standards of cleanliness and quality, because even in a world of crime, we believe in a good, clean burger.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section id="menu" className="py-24 sm:py-32">
          <div className="container px-4 mx-auto">
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-bold tracking-tight text-white uppercase font-headline md:text-5xl">
                Our <span className="text-primary">Menu</span>
              </h2>
              <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
                Simple, iconic, and dangerously good.
              </p>
            </div>
            
            <div className="space-y-12">
              <div>
                <h3 className="mb-6 text-3xl font-bold text-center text-accent font-headline">Burgers</h3>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {menuItems.burgers.map((item) => (
                    <Card key={item.name} className="flex flex-col text-center bg-card neon-border">
                      <CardHeader>
                        <CardTitle className="text-2xl text-primary">{item.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <CardDescription>{item.description}</CardDescription>
                      </CardContent>
                      <CardContent>
                        <p className="text-xl font-bold text-accent">{item.price}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-6 text-3xl font-bold text-center text-accent font-headline">Sides & Drinks</h3>
                <div className="grid gap-8 md:grid-cols-2">
                    {menuItems.sides.map((item) => (
                        <Card key={item.name} className="text-center bg-card neon-border">
                            <CardHeader>
                                <CardTitle className="text-xl text-primary">{item.name}</CardTitle>
                            </CardHeader>
                             <CardContent className="flex-grow">
                                <CardDescription>{item.description}</CardDescription>
                            </CardContent>
                            <CardContent>
                                <p className="text-lg font-bold text-accent">{item.price}</p>
                            </CardContent>
                        </Card>
                    ))}
                    {menuItems.drinks.map((item) => (
                        <Card key={item.name} className="text-center bg-card neon-border">
                            <CardHeader>
                                <CardTitle className="text-xl text-primary">{item.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <CardDescription>{item.description}</CardDescription>
                            </CardContent>
                            <CardContent>
                               <p className="text-lg font-bold text-accent">{item.price}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
