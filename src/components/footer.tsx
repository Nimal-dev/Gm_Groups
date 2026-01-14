'use client';

import { Logo } from "./logo";
import Image from "next/image";
import Link from "next/link";
import x from "../../public/xlantis.png";

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full py-12 bg-background border-t border-white/5 relative z-10">
      <div className="container flex flex-col items-center justify-between gap-8 px-4 mx-auto md:flex-row">

        <div className="flex flex-col items-center md:items-start gap-4">
          <Logo />
          <p className="text-sm text-muted-foreground text-center md:text-left max-w-xs">
            Dominating the streets of Xlantis. <br />
            Power. Respect. Loyalty.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Link href="https://discord.com/invite/xlantis-city-1161948313759789128" target="_blank" className="opacity-80 hover:opacity-100 transition-opacity">
            <Image
              src={x}
              alt="Xlantis City"
              width={150}
              height={80}
              className="object-contain"
            />
          </Link>
          <p className="text-xs text-muted-foreground/60">
            Official Faction of Xlantis City
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-2 text-sm text-muted-foreground">
          <p>&copy; {currentYear} GM Groups Pvt Ltd.</p>
          <p>All Rights Reserved.</p>
          <div className="flex gap-4 mt-2">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
