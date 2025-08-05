import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { Logo } from "@/components/logo";

export function HeroSection() {
  return (
    <section 
      id="hero" 
      className="relative flex items-center justify-center w-full min-h-screen text-white bg-center bg-cover bg-no-repeat bg-fixed"
      style={{backgroundImage: "url('https://media.discordapp.net/attachments/1402190606301794395/1402190744231477329/wp_logo.jpg?ex=68930364&is=6891b1e4&hm=aba8dc0b8113428567257b43fdcb1e02cd38c9d5adebd5221bbb3743eb14c1c7&=&format=webp&width=1423&height=800')"}}
      data-ai-hint="cinematic city nightscape"
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex flex-col items-center max-w-4xl p-8 text-center">
        <div className="mb-8 scale-150">
            <Logo />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white uppercase font-headline md:text-6xl lg:text-7xl">
          Dominating the Streets of Xlantis
        </h1>
        <div className="w-full max-w-md mt-6">
          <p className="mt-4 text-lg italic text-center text-accent animate-pulse font-headline">
            &ldquo;The city never sleeps. Neither do we.&rdquo;
          </p>
        </div>
        <div className="mt-10">
          <Button asChild size="lg" className="px-10 py-6 text-lg font-bold text-background bg-accent neon-button hover:bg-accent/90">
            <Link href="#join">Join The Family</Link>
          </Button>
        </div>
      </div>
      <div className="absolute z-10 bottom-10">
        <Link href="#about" aria-label="Scroll down">
          <ArrowDown className="w-8 h-8 text-white animate-bounce" />
        </Link>
      </div>
    </section>
  );
}
