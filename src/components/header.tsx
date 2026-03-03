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

export function Header() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed z-50 flex items-center justify-between transition-all duration-500 ease-in-out",
        scrolled
          ? "top-4 inset-x-0 mx-auto w-[95%] max-w-7xl px-8 py-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.8)]"
          : "top-0 left-0 right-0 px-6 py-6 bg-transparent"
      )}
    >
      <div className="flex items-center gap-2">
        <Logo />
      </div>

      <nav className="items-center hidden gap-1 p-1 border rounded-full md:flex border-[#ffd700]/20 bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(255,215,0,0.05)]">
        <NavItem href="/">Home</NavItem>
        <NavItem href="/#about">About</NavItem>
        <NavItem href="/#pillars">Pillars</NavItem>
        <NavItem href="/burgershot">Burgershot</NavItem>



        <NavItem href="/#join">Join Us</NavItem>
      </nav>

      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" asChild className="flex text-white hover:bg-white/10 rounded-full">
          <Link href="/dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden lg:inline">Dashboard</span>
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="relative px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-[#ffd700] bg-black/40 hover:bg-black/60 border border-[#ffd700]/30 rounded-full transition-all flex items-center gap-1 outline-none data-[state=open]:bg-black/60 data-[state=open]:border-[#ffd700]/60 data-[state=open]:shadow-[0_0_20px_rgba(255,215,0,0.3)] backdrop-blur-md">
              Services <ChevronDown className="w-3 h-3 md:w-4 md:h-4 ml-0.5 md:ml-1 transition-transform duration-300 data-[state=open]:rotate-180" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="bg-black/80 border border-[#ffd700]/20 backdrop-blur-2xl text-white w-56 p-2 rounded-xl shadow-[0_8px_32px_rgba(255,215,0,0.1)] ring-1 ring-white/5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 duration-200 ease-in-out">
            <DropdownMenuItem asChild className="group flex items-center gap-3 p-3 rounded-lg focus:bg-white/5 focus:text-white cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-900/40 hover:to-blue-900/40 border border-transparent hover:border-white/10">
              <Link href="/catering-request" className="flex items-center gap-2 w-full">
                <div className="w-8 h-8 rounded-lg bg-[#ffd700]/10 flex items-center justify-center group-hover:bg-[#ffd700]/20 transition-colors">
                  <UtensilsCrossed className="w-4 h-4 text-[#ffd700] group-hover:text-[#ffe033]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm group-hover:text-[#ffd700] transition-colors">Catering Request</span>
                  <span className="text-[10px] text-muted-foreground group-hover:text-white/70">Events & Bulk Food</span>
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" className="hidden border-[#ffd700]/50 hover:bg-[#ffd700] hover:text-black hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] md:flex bg-black/40 backdrop-blur-md text-[#ffd700] transition-all rounded-full">
          <Link href="/#join">Enlist Now</Link>
        </Button>
      </div>
    </motion.header>
  );
}

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button variant="ghost" asChild className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-[#ffd700] hover:bg-[#ffd700]/10 rounded-full transition-colors">
      <Link href={href}> {children} </Link>
    </Button>
  );
}
