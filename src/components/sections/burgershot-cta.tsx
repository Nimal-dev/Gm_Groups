import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function BurgershotCTA() {
  return (
    <section id="burgershot-cta" className="py-20 bg-background/50 sm:py-28">
      <div className="container px-4 mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white uppercase font-headline md:text-4xl">
          Taste the Power
        </h2>
        <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
          Explore our flagship business, see what's on the menu, and understand why Burgershot is the true heart of Xlantis.
        </p>
        <div className="mt-8">
          <Button asChild size="lg" className="px-10 py-6 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/burgershot">
              Explore Burgershot <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
