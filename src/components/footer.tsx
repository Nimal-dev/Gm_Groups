import { Logo } from "./logo";
import Image from "next/image";
 import x from "../../public/xlantis.png";
 import Link from "next/link";


export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full py-6 bg-background border-t border-white/10">
      <div className="container flex flex-col items-center justify-between px-4 mx-auto md:flex-row">
        <Logo />
        <Link href="https://discord.com/invite/xlantis-city-1161948313759789128">
         <Image data-aos="fade-down" data-aos-delay="200"
                         src= {x}
                         alt="Xlantis Dc"
                         width={200}
                         height={100}
                         className="object-cover w-60 h-40 transition-transform duration-500 group-hover:scale-105"
                        //  data-ai-hint={pillar.image.hint}
                       />
        </Link>
      
        <p className="mt-4 text-sm text-muted-foreground md:mt-0">
          &copy; {currentYear} GM Groups Pvt Ltd. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
