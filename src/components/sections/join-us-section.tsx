import { Button } from "@/components/ui/button";
import Link from "next/link";

const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.54 5.37a10.45 10.45 0 0 0-4.14-1.58 11.2 11.2 0 0 0-1.12.87A10.19 10.19 0 0 0 12 4.5a10.19 10.19 0 0 0-2.28.16 11.2 11.2 0 0 0-1.12-.87 10.45 10.45 0 0 0-4.14 1.58C1.7 8.07 1.56 11.33 3.31 14a10.87 10.87 0 0 0 2.23 2.19 8.27 8.27 0 0 0 3.32 1.45 9.17 9.17 0 0 0 1.25.13 10.39 10.39 0 0 0 1.79-.12 10.32 10.32 0 0 0 1.79.12 9.17 9.17 0 0 0 1.25-.13 8.27 8.27 0 0 0 3.32-1.45 10.87 10.87 0 0 0 2.23-2.19c1.75-2.67 1.61-5.93-1.07-8.63ZM8.68 14.86a1.92 1.92 0 0 1-1.89-1.92A1.92 1.92 0 0 1 8.68 11a1.92 1.92 0 0 1 0 3.84Zm6.64 0a1.92 1.92 0 0 1-1.89-1.92 1.92 1.92 0 0 1 1.89-1.92 1.92 1.92 0 0 1 0 3.84Z"/>
    </svg>
);


export function JoinUsSection() {
  return (
    <section 
      id="join" 
      className="relative py-32 text-white bg-center bg-cover bg-fixed sm:py-48"
      style={{backgroundImage: "url('https://media.discordapp.net/attachments/1402190606301794395/1402199591612317696/ChatGPT_Image_Aug_5_2025_01_28_17_PM_1.png?ex=68930ba2&is=6891ba22&hm=c26b37f327d0704c5ca223352bfab527ff0bf219043e29aa74c1e9c52f902825&=&format=webp&quality=lossless&width=656&height=438')"}}
      data-ai-hint="luxury cars night city"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-background via-black/80 to-black/70" />
      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white uppercase font-headline md:text-5xl">
            Ready to Join The Elite?
          </h2>
          <p className="max-w-2xl mx-auto mt-6 text-xl text-muted-foreground">
            Loyalty is our currency and power is our language. If you have what it takes to thrive in the high-stakes world of Xlantis, your family is waiting.
          </p>
          <div className="mt-10">
            <Button asChild size="lg" className="flex items-center px-10 py-6 text-lg font-bold text-background bg-accent neon-button hover:bg-accent/90">
              <Link href="https://discord.gg/jfgTHBnVYD" target="_blank" rel="noopener noreferrer">
                <DiscordIcon className="w-6 h-6 mr-2" />
                Join our Discord
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
