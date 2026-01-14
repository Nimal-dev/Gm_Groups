'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { scaleIn } from "@/lib/animation-utils";
import gmxdc from "../../../public/gm_dc.png"

const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.54 5.37a10.45 10.45 0 0 0-4.14-1.58 11.2 11.2 0 0 0-1.12.87A10.19 10.19 0 0 0 12 4.5a10.19 10.19 0 0 0-2.28.16 11.2 11.2 0 0 0-1.12-.87 10.45 10.45 0 0 0-4.14 1.58C1.7 8.07 1.56 11.33 3.31 14a10.87 10.87 0 0 0 2.23 2.19 8.27 8.27 0 0 0 3.32 1.45 9.17 9.17 0 0 0 1.25.13 10.39 10.39 0 0 0 1.79-.12 10.32 10.32 0 0 0 1.79.12 9.17 9.17 0 0 0 1.25-.13 8.27 8.27 0 0 0 3.32-1.45 10.87 10.87 0 0 0 2.23-2.19c1.75-2.67 1.61-5.93-1.07-8.63ZM8.68 14.86a1.92 1.92 0 0 1-1.89-1.92A1.92 1.92 0 0 1 8.68 11a1.92 1.92 0 0 1 0 3.84Zm6.64 0a1.92 1.92 0 0 1-1.89-1.92 1.92 1.92 0 0 1 1.89-1.92 1.92 1.92 0 0 1 0 3.84Z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);


export function JoinUsSection() {
  return (
    <section
      id="join"
      className="relative py-32 sm:py-48 flex items-center justify-center overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-center bg-cover bg-fixed transform scale-105 blur-[2px]"
        style={{ backgroundImage: `url(${gmxdc.src})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-black/90 to-black/80" />

      <div className="container relative z-10 px-4 mx-auto text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scaleIn}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight uppercase text-white mb-6">
            Ready to Join The <span className="text-accent">Elite</span>?
          </h2>
          <p className="max-w-xl mx-auto text-xl text-muted-foreground mb-10 leading-relaxed">
            Loyalty is our currency and respect is our language. If you have what it takes to thrive in the high-stakes world of Xlantis, we are waiting for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="flex items-center px-8 py-6 text-lg font-bold bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <Link href="https://discord.gg/jfgTHBnVYD" target="_blank" rel="noopener noreferrer">
                <DiscordIcon className="w-6 h-6 mr-2" />
                Join our Discord
              </Link>
            </Button>

            <Button asChild size="lg" className="flex items-center px-8 py-6 text-lg font-bold bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:brightness-110 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <Link href="https://www.instagram.com/ig.gmgroups/" target="_blank" rel="noopener noreferrer">
                <InstagramIcon className="w-6 h-6 mr-2" />
                Follow on Instagram
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
