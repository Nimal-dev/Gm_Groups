import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function BusinessSection() {
  return (
    <section 
      id="business" 
      className="relative py-32 text-white bg-center bg-cover bg-fixed sm:py-48"
      style={{backgroundImage: "url('https://cdn.discordapp.com/attachments/1402190606301794395/1402196301814169631/BS_1.png?ex=68930891&is=6891b711&hm=c292387f17da90d3f31bf96773162176462243db88ca2339276111741034a154&')"}}
      data-ai-hint="neon diner night"
    >
      <div className="absolute inset-0 bg-black/70" />
      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white uppercase font-headline md:text-5xl" data-aos="fade-up">
            Our Business: <span className="text-primary">Burgershot</span>
          </h2>
          <p className="max-w-2xl mx-auto mt-6 text-xl text-muted-foreground" data-aos="fade-up" data-aos-delay="200">
            More than just a fast-food joint, Burgershot is a hub of information, a neutral ground for meetings, and a symbol of our public-facing dominance. It's the jewel in our commercial crown.
          </p>
          <blockquote className="mt-8 text-2xl italic font-semibold text-accent font-headline" data-aos="fade-up" data-aos-delay="400">
            &ldquo;Where crime meets cuisine.&rdquo;
          </blockquote>
           <div className="mt-8" data-aos="fade-up" data-aos-delay="600">
          <Button asChild size="lg" className="px-10 py-6 text-lg font-bold bg-primary text-primary-foreground hover:bg-secondary/90">
            <Link href="/burgershot">
              Explore Burgershot <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
        </div>
       
      </div>
    </section>
  );
}
