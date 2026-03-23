'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";

const MENU_ITEMS = [
    {
        id: 1,
        name: "GM Signature",
        description: "Our signature double-patty beast with secret Xlantis sauce.",
        price: "$15.00",
        image: "/koicafe_bg.png",
    },
    {
        id: 2,
        name: "Spicy Shogun",
        description: "Classic American style with a spicy kick that leaves a mark.",
        price: "$12.50",
        image: "/koicafe_bg.png",
    },
    {
        id: 3,
        name: "Zen Garden Combo",
        description: "The complete meal for the city's power players.",
        price: "$25.00",
        image: "/koicafe_bg.png",
    },
];

function MenuCard({ item }: { item: typeof MENU_ITEMS[0] }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rX = (y - centerY) / 10;
        const rY = (centerX - x) / 10;
        setRotateX(rX);
        setRotateY(rY);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ rotateX, rotateY }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ transformStyle: "preserve-3d" }}
            className="glass-pane p-6 group cursor-pointer relative"
        >
            <div className="absolute inset-0 border border-[#27cb63]/0 group-hover:border-[#27cb63]/40 transition-colors duration-500 rounded-xl" />

            <div style={{ transform: "translateZ(50px)" }} className="relative z-10">
                <div className="relative h-48 w-full mb-6 overflow-hidden rounded-lg bg-black/40">
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black uppercase text-white tracking-tighter">{item.name}</h3>
                        <span className="text-[#27cb63] font-bold">{item.price}</span>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed">{item.description}</p>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="mt-6 h-1 w-full bg-gradient-to-r from-[#27cb63] to-transparent"
                />
            </div>

            {/* Background Glow */}
            <div className="absolute -inset-2 bg-[#27cb63]/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
        </motion.div>
    );
}

export function MenuSection() {
    return (
        <section id="menu" className="py-32 relative bg-[#0a0a0a]">
            <div className="container px-4 mx-auto">
                <div className="flex flex-col items-center mb-16 space-y-4">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-[#27cb63] font-bold tracking-[0.3em] uppercase text-xs"
                    >
                        The KOI Cafe Experience
                    </motion.span>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-center">
                        <span className="text-white">POWER ON A</span><br />
                        <span className="text-zinc-700">PLATTER</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {MENU_ITEMS.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            <MenuCard item={item} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
