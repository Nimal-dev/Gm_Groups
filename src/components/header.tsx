'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Logo } from "@/components/logo";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, UtensilsCrossed, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";

export function Header() {
  const { scrollY } = useScroll();
  const { data: session } = useSession();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isClient = session?.user?.role === 'client';

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setScrolled(latest > 50);
  });

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300",
        scrolled ? "bg-background/60 backdrop-blur-md border-b border-white/10 shadow-lg" : "bg-transparent"
      )}
    >
      <div className="flex items-center gap-2">
        <Logo />
      </div>

      <nav className="items-center hidden gap-1 p-1 border rounded-full md:flex border-white/10 bg-white/5 backdrop-blur-sm">
        <NavItem href="/">Home</NavItem>
        <NavItem href="/#about">About</NavItem>
        <NavItem href="/#pillars">Pillars</NavItem>
        <NavItem href="/burgershot">Burgershot</NavItem>



        <NavItem href="/#join">Join Us</NavItem>
      </nav>

      <div className="flex items-center gap-4">

        {!isClient && (
          <Button variant="ghost" asChild className="flex text-white hover:bg-white/10 rounded-full mr-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="relative px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all flex items-center gap-1 outline-none neon-border data-[state=open]:bg-white/20 data-[state=open]:border-accent/50 data-[state=open]:text-accent data-[state=open]:shadow-neon-strong">
              Services <ChevronDown className="w-4 h-4 ml-1 transition-transform duration-300 data-[state=open]:rotate-180" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="bg-black/90 border border-white/10 backdrop-blur-2xl text-white w-56 p-2 rounded-xl shadow-neon-border ring-1 ring-white/5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 duration-200 ease-in-out">
            <DropdownMenuItem asChild className="group flex items-center gap-3 p-3 rounded-lg focus:bg-white/5 focus:text-white cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-900/40 hover:to-blue-900/40 border border-transparent hover:border-white/10">
              <Link href="/catering-request" className="flex items-center gap-2 w-full">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                  <UtensilsCrossed className="w-4 h-4 text-orange-400 group-hover:text-orange-300" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Catering Request</span>
                  <span className="text-[10px] text-muted-foreground group-hover:text-white/70">Events & Bulk Food</span>
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" className="hidden border-accent/50 hover:bg-accent hover:text-white md:flex neon-border">
          <Link href="/#join">Enlist Now</Link>
        </Button>
      </div>
    </motion.header>
  );
}

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button variant="ghost" asChild className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/10 rounded-full transition-colors">
      <Link href={href}> {children} </Link>
    </Button>
  );
}
