'use client';

import { motion } from "framer-motion";
import Image from "next/image";

const GALLERY_IMAGES = [
    { id: 1, src: "/interior_reception.webp", title: "Front Desk & Reception" },
    { id: 2, src: "/interior_bar.webp", title: "Cocktail Bar & Lounge" },
    { id: 3, src: "/interior_wine_cellar.webp", title: "Wine Cellar & VIP Dining" },
    { id: 4, src: "/interior_promenade.webp", title: "Art Gallery Promenade" },
    { id: 5, src: "/gmcafe_bg.webp", title: "GM Cafe Flagship Exterior" },
    { id: 6, src: "/interior_captains_deck.webp", title: "Captain's Deck Lounge" },
];

export function GallerySection() {
    return (
        <section id="gallery" className="py-32 bg-black overflow-hidden">
            <div className="container px-4 mx-auto">
                <div className="flex flex-col mb-16">
                    <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="text-[#D4AF37] font-bold tracking-[0.3em] uppercase text-xs mb-4"
                    >
                        The Interior & Atmosphere
                    </motion.span>
                    <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase">
                        <span className="text-white">GM CAFE</span><br />
                        <span className="text-[#D4AF37]">EXPERIENCE</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {GALLERY_IMAGES.map((image, index) => (
                        <motion.div
                            key={image.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className="relative aspect-video overflow-hidden group glass-pane p-2 border border-white/5 hover:border-[#D4AF37]/30 transition-colors"
                        >
                            <div className="relative w-full h-full overflow-hidden rounded-lg">
                                <Image
                                    src={image.src}
                                    alt={image.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                    <span className="text-[#D4AF37] font-black uppercase tracking-wider text-sm drop-shadow-md">{image.title}</span>
                                    <span className="text-zinc-300 text-xs font-light tracking-wide mt-1">GM Cafe Luxury Dining</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
