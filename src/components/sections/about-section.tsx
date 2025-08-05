import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-background sm:py-32">
      <div className="container px-4 mx-auto">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold tracking-tight text-white uppercase font-headline md:text-5xl">
              About <span className="text-primary">GM Groups</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              GM Groups Pvt Ltd stands as the most dominant Roleplay club on the Xlantis server. Our roots run deep in the city's underbelly and its high-flying corporate world. We are more than a crew; we are a family bound by a legacy of strategic business, and unwavering loyalty.
            </p>
            <p className="text-lg text-muted-foreground">
              Our influence extends to every corner of the city, most notably through our ownership of <span className="font-bold text-primary">Burgershot</span> – the most loved and frequented fast-food spot in Xlantis. It's a testament to our public face, a symbol of our power to control both the streets and the spreadsheets.
            </p>
          </div>
          <div className="w-full">
            <Card className="overflow-hidden border-2 neon-border">
              <CardContent className="p-0">
                <Image
                  src="https://cdn.discordapp.com/attachments/1402190606301794395/1402190969096372387/1.png?ex=6893039a&is=6891b21a&hm=1decdb7202f1276a8f0fee390a69f9567a2182e50ae57130180c9064ff000ae8&"
                  alt="Burgershot restaurant"
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
