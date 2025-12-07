import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="text-2xl font-bold tracking-tighter uppercase transition-colors text-snow-title font-festive hover:text-accent">
      GM Groups <span className="text-snow-accent">Pvt Ltd</span>
    </Link>

  );
}
