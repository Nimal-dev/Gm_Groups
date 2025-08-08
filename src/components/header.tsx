import Link from "next/link";
import { Logo } from "@/components/logo";
import { MusicToggle } from "@/components/music-toggle";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-background/50 backdrop-blur-sm md:p-6">
      <Logo />
      <nav className="items-center hidden gap-4 md:flex">
         <Button variant="ghost" asChild className="text-white hover:text-accent">
             <Link href="/"> Home </Link>  
        </Button>
       
        <Button variant="ghost" asChild className="text-white hover:text-accent">
            <Link href="/#about">About</Link>
        </Button>
        <Button variant="ghost" asChild className="text-white hover:text-accent">
            <Link href="/#pillars">Pillars</Link>
        </Button>
        <Button variant="ghost" asChild className="text-white hover:text-accent">
            <Link href="/burgershot">Burgershot</Link>
        </Button>
        <Button variant="ghost" asChild className="text-white hover:text-accent">
            <Link href="/#join">Join Us</Link>
        </Button>
      </nav>
      <div className="flex items-center gap-2">
        {/* <MusicToggle /> */}
        {/* Add mobile menu toggle here if needed */}
      </div>
    </header>
  );
}
