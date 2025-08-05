import { Logo } from "@/components/logo";
import { MusicToggle } from "@/components/music-toggle";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-background/50 backdrop-blur-sm md:p-6">
      <Logo />
      <MusicToggle />
    </header>
  );
}
