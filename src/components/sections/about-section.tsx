import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

import gm_logo from "../../../public/gm_logo.png"

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-background sm:py-32">
      <div className="container px-4 mx-auto">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6" data-aos="fade-right">
            <h2 className="text-4xl font-bold tracking-tight text-white uppercase font-headline md:text-5xl" data-aos="fade-up">
              About <span className="text-primary">GM Groups</span>
            </h2>
            <p className="text-lg text-muted-foreground" data-aos="fade-up" data-aos-delay="200">
              GM Groups Pvt Ltd stands as the most dominant Roleplay club on the Xlantis server. Our roots run deep in the city's underbelly and its high-flying corporate world. We are more than a crew; we are a family bound by a legacy of strategic business, and unwavering loyalty.
            </p>
            <p className="text-lg text-muted-foreground" data-aos="fade-up" data-aos-delay="400">
              Our influence extends to every corner of the city, most notably through our ownership of <span className="font-bold text-primary">Burgershot</span> – the most loved and frequented fast-food spot in Xlantis. It's a testament to our public face, a symbol of our power to control both the streets and the spreadsheets.
            </p>
          </div>
          <div className="w-full" data-aos="fade-left">
            <Card className="overflow-hidden border-2 neon-border">
              <CardContent className="p-0">
                <Image
                  src= {gm_logo}
                  alt="GM_Logo"
                  width={600}
                  height={400}
                  className="object-cover w-full h-auto"
                  data-ai-hint="fast food restaurant night"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
