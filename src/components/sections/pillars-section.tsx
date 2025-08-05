import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const pillars = [
  {
    name: "Nimal Prince",
    title: "The Manager",
    description: "The engine of our operations. The Manager ensures every deal is sealed, every asset is managed, and the gears of our enterprise turn smoothly.",
    image: {
      src: "https://cdn.discordapp.com/attachments/1402190606301794395/1402256964821455060/nimal.png?ex=68934111&is=6891ef91&hm=51dd3245356d411d9c513a2dd3d8ea5fd0f2f91a3be80f7cc5064fd155f46934&",
      hint: "gta character male business"
    }
  },
  {
    name: "Godwin memana",
    title: "The Boss",
    description: "The architect of our empire. With a mind for strategy and a vision that cuts through the chaos, The Boss guides our every move.",
    image: {
      src: "https://cdn.discordapp.com/attachments/1402190606301794395/1402391214288015451/GM.png?ex=6893be18&is=68926c98&hm=e6d0838f2999a7e1a8eb31364eeb97108800e5ac77de1c48f409f4f0bf51c6e1&",
      hint: "gta character male suit"
    }
  },
  
  {
    name: "Ambaan op",
    title: "The Legal Advisor",
    description: "The shadow navigates the treacherous waters of the law, ensuring our business remains untouchable.",
    image: {
      src: "https://media.discordapp.net/attachments/1402190606301794395/1402216730826248315/Ambaan.png?ex=68931b98&is=6891ca18&hm=5150ed6ce7557295bb0f90d292c211edff34f1ee21f906e7991a280a4fea0633&=&format=webp&quality=lossless&width=533&height=800",
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
            Our<span className="text-primary">Pillars</span>
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
