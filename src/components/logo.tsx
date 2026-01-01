import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="text-2xl font-bold tracking-tighter uppercase transition-colors hover:text-accent">
      GM Groups <span className="text-accent">Pvt Ltd</span>
    </Link>

  );
}
