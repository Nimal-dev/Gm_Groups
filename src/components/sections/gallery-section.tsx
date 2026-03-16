'use client';

import { motion } from "framer-motion";
import Image from "next/image";

const GALLERY_IMAGES = [
    { id: 1, src: "/1.png", title: "The High Life" },
    { id: 2, src: "/2.png", title: "Strategic Operations" },
    { id: 3, src: "/3.png", title: "The Inner Circle" },
    { id: 4, src: "/kitchen.png", title: "KOI Cafe Kitchen" },
    { id: 5, src: "/gm_logo_dark.png", title: "Xlantis Skyline" },
    { id: 6, src: "/bsoffice.png", title: "Executive Suite" },
];

export function GallerySection() {
    return (
        <section id="gallery" className="py-32 bg-black overflow-hidden">
            <div className="container px-4 mx-auto">
                <div className="flex flex-col mb-16">
                    <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="text-[#27cb63] font-bold tracking-[0.3em] uppercase text-xs mb-4"
                    >
                        The Showcase
                    </motion.span>
                    <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase">
                        <span className="text-white">KOI CAFE</span><br />
                        <span className="text-zinc-800">EXPERIENCES</span>
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
                            className="relative aspect-video overflow-hidden group glass-pane p-2"
                        >
                            <div className="relative w-full h-full overflow-hidden rounded-lg">
                                <Image
                                    src={image.src}
                                    alt={image.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                                    {/* <span className="text-primary font-black uppercase tracking-widest text-sm">{image.title}</span> */}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
