
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

import bs_shop from "../../../public/bs.png"
import gmxtokyo from "../../../public/GMxTKY_site.png"
import kitchen from "../../../public/kitchen.png"

const menuItems = {
  burgers: [
    { name: "Steahouse Supreme Burger", price: "$25,000", description: "Our signature classic. A mix of juicy chicken, bacon and steak patty, special sauce, lettuce, cheese, pickles, onions, ketchup on a sesame seed bun." },
    { name: "Sunrise Ham Melt Sandwich", price: "$11,000", description: "Double cheese, ham, and a fried egg. Not for the faint of heart." },
    { name: "NEW BURGERS & SANDWICHES", price: "COMING SOON!", description: "Coming Soon!" },

  ],
  sides: [
    { name: " Fries", price: "$5,000", description: "Crispy, salty, and perfect for sharing. Or not." },

  ],
  drinks: [
    { name: "E-Cola", price: "$25,000", description: "The classic taste of virtual refreshment." },
    { name: "Sprunk", price: "$11,000", description: "For when you need that extra green kick." },
    { name: "NEW SIDES AND DRINKS", price: "COMING SOON!", description: "Coming Soon!" },
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
          style={{ backgroundImage: `url(${bs_shop.src})` }}

          data-ai-hint="fast food restaurant interior"
        >
          <div className="absolute inset-0 bg-black/70" />
          <div className="container relative z-10 px-4 mx-auto text-center">
            <h1 className="text-5xl font-bold tracking-tight text-white uppercase font-headline md:text-7xl" data-aos="fade-up">
              Welcome to <span className="text-primary">Burgershot</span>
            </h1>
            <p className="max-w-3xl mx-auto mt-6 text-2xl italic text-accent font-headline" data-aos="fade-up" data-aos-delay="200">
              &ldquo;The Taste of Freedom and Profit.&rdquo;
            </p>
          </div>
        </section>
{/* INVESTORS SECTION */}

        <section
          id="business"
          className="relative py-32 text-white bg-center bg-cover bg-fixed sm:py-48"
          style={{ backgroundImage: `url(${gmxtokyo.src})` }}
          data-ai-hint="neon diner night"
        >
          <div className="absolute inset-0 bg-black/70" />
          <div className="container relative z-10 px-4 mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl font-bold tracking-tight text-white uppercase font-headline md:text-5xl" data-aos="fade-up">
                MEET OUR <span className="text-primary">INVESTORS</span>
              </h2>
              <p className="max-w-2xl mx-auto mt-6 text-2xl text-bold text-muted-foreground text-center" data-aos="fade-up" data-aos-delay="200">
                At GM Groups, we take pride in our ventures—and none more than our beloved Burgershot outlet. This dream wouldn’t have been possible without the unwavering support of our sole investor, the Tokyo Family. Their full financial backing brought our vision to life, helping us serve great taste with unmatched passion. This is a joint venture between GM x TOKYO.
              </p>
            </div>

          </div>
        </section>
{/* The abiance section */}
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
                  opts={{
                    loop: true,
                    align: 'start',
                    skipSnaps: false,
                  }}
                >
                  <CarouselContent>
                    {ambianceImages.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="relative overflow-hidden rounded-lg">
                          <Image
                            src={image.src}
                            alt={image.alt}
                            width={600}
                            height={400}
                            className="object-cover w-full h-auto transition-transform duration-700 ease-in-out hover:scale-105"
                            data-ai-hint={image.hint}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </Card>
            </div>
          </div>
        </section>
{/* The Kitchen section */}
        <section id="kitchen" className="py-24 bg-background/50 sm:py-32">
          <div className="container px-4 mx-auto">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <Card className="overflow-hidden border-2 neon-border lg:order-last">
                <Image
                  src= {kitchen}
                  alt="Burgershot kitchen"
                  width={600}
                  height={400}
                  className="object-cover w-full h-auto"
                  data-ai-hint="restaurant kitchen action"
                />
              </Card>
              <div className="lg:order-last">
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
