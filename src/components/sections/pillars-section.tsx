import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const pillars = [
  {
    name: "The Boss",
    title: "Strategic Leader & Visionary",
    description: "The architect of our empire. With a mind for strategy and a vision that cuts through the chaos, The Boss guides our every move.",
    image: {
      src: "https://placehold.co/400x500.png",
      hint: "gta character male suit"
    }
  },
  {
    name: "The Manager",
    title: "Operations & Deals",
    description: "The engine of our operations. The Manager ensures every deal is sealed, every asset is managed, and the gears of our enterprise turn smoothly.",
    image: {
      src: "https://placehold.co/400x500.png",
      hint: "gta character female business"
    }
  },
  {
    name: "The Legal Advisor",
    title: "Clean-ups & Cover-ups",
    description: "The Legal Advisor navigates the treacherous waters of the law, ensuring our business remains untouchable.",
    image: {
      src: "https://placehold.co/400x500.png",
      hint: "gta character male lawyer"
    }
  }
];

export function PillarsSection() {
  return (
    <section id="pillars" className="py-24 bg-background/80 sm:py-32">
      <div className="container px-4 mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white uppercase font-headline md:text-5xl">
            Our <span className="text-primary">Pillars</span>
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
            Three core members form the foundation of our power.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <Card key={pillar.name} className="relative overflow-hidden text-center transition-transform duration-300 transform border-2 group bg-card neon-border hover:-translate-y-2">
              <CardHeader className="p-0">
                <Image
                  src={pillar.image.src}
                  alt={pillar.name}
                  width={400}
                  height={500}
                  className="object-cover w-full h-auto transition-transform duration-500 group-hover:scale-105"
                  data-ai-hint={pillar.image.hint}
                />
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="text-2xl font-bold uppercase text-primary font-headline">{pillar.name}</CardTitle>
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
