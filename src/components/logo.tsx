import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="text-2xl font-bold tracking-tighter uppercase transition-colors hover:text-accent">
      <span className="hidden md:inline">GM Groups <span className="text-accent">Pvt Ltd</span></span>
      <span className="md:hidden">GM <span className="text-accent">CLUB</span></span>
    </Link>
  );
}
