import Image from "next/image";

export function BusinessSection() {
  return (
    <section 
      id="business" 
      className="relative py-32 text-white bg-center bg-cover bg-fixed sm:py-48"
      style={{backgroundImage: "url('https://placehold.co/1920x1080.png')"}}
      data-ai-hint="neon diner night"
    >
      <div className="absolute inset-0 bg-black/70" />
      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white uppercase font-headline md:text-5xl">
            Our Business: <span className="text-primary">Burgershot</span>
          </h2>
          <p className="max-w-2xl mx-auto mt-6 text-xl text-muted-foreground">
            More than just a fast-food joint, Burgershot is a hub of information, a neutral ground for meetings, and a symbol of our public-facing dominance. It's the jewel in our commercial crown.
          </p>
          <blockquote className="mt-8 text-2xl italic font-semibold text-accent font-headline">
            &ldquo;Where crime meets cuisine.&rdquo;
          </blockquote>
        </div>
      </div>
    </section>
  );
}
