import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="text-2xl font-bold tracking-tighter text-white uppercase transition-colors font-headline hover:text-accent">
      GM Groups <span className="text-accent">Pvt Ltd</span>
    </Link>

  );
}
