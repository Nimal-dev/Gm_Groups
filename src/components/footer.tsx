import { Logo } from "./logo";

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full py-6 bg-background border-t border-white/10">
      <div className="container flex flex-col items-center justify-between px-4 mx-auto md:flex-row">
        <Logo />
        <p className="mt-4 text-sm text-muted-foreground md:mt-0">
          &copy; {currentYear} GM Groups Pvt Ltd. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
