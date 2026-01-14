'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Logo } from "@/components/logo";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
