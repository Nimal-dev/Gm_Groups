import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import gm from "../../../public/GM.png"
import ambaan from "../../../public/Ambaan.png"
import nimal from "../../../public/Nimal.png"

const pillars = [
  {
    name: "Nimal Prince",
    title: "The Manager",
    description: "The engine of our operations. The Manager ensures every deal is sealed, every asset is managed, and the gears of our enterprise turn smoothly.",
    image: {
      src: nimal,
      hint: "gta character male business"
    }
  },
  {
    name: "Godwin memana",
    title: "The Boss",
    description: "The architect of our empire. With a mind for strategy and a vision that cuts through the chaos, The Boss guides our every move.",
    image: {
      src: gm,
      hint: "gta character male suit"
    }
  },

  {
    name: "Ambaan op",
    title: "The Legal Advisor",
    description: "The shadow navigates the treacherous waters of the law, ensuring our business remains untouchable.",
    image: {
      src: ambaan,
      hint: "gta character male lawyer"
    }
  }
];

export function PillarsSection() {
  return (
    <section id="pillars" className="py-24 bg-background/80 sm:py-32">
      <div className="container px-4 mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-snow-title uppercase font-festive md:text-5xl" data-aos="fade-up" data-aos-delay="200">
            Our<span className="text-snow-primary"> Pillars</span>
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground" data-aos="fade-up" data-aos-delay="200">
            Three core members form the foundation of our power.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <Card key={pillar.name} className="relative overflow-hidden text-center transition-transform duration-300 transform border-2 group bg-card neon-border hover:-translate-y-2" >
              <CardHeader className="p-0">
                <Image data-aos="fade-down" data-aos-delay="200"
                  src={pillar.image.src}
                  alt={pillar.name}
                  width={400}
                  height={500}
                  className="object-cover w-full h-auto transition-transform duration-500 group-hover:scale-105"
                  data-ai-hint={pillar.image.hint}
                />
              </CardHeader>
              <CardContent className="p-6" data-aos="fade-up" data-aos-delay="200">
                <CardTitle className="text-2xl font-bold uppercase text-snow-primary font-festive">{pillar.name}</CardTitle>
                <p className="mt-1 text-sm font-semibold tracking-widest text-accent">{pillar.title}</p>
                <CardDescription className="mt-4 text-muted-foreground">{pillar.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
