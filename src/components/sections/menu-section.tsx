'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";

const MENU_ITEMS = [
    {
        id: 1,
        name: "BBQ Ribs",
        jpName: "BBQリブ",
        description: "Tender, slow-cooked ribs glazed with our signature Japanese BBQ sauce.",
        price: "26,400",
        image: "/Menu/BBQ_ribs.png",
        colorTheme: "red",
        tag: "焼き肉" // Yakiniku (Grilled meat)
    },
    {
        id: 2,
        name: "Ramen",
        jpName: "ラーメン",
        description: "Authentic rich broth with authentic noodles, sliced pork, and a soft-boiled egg.",
        price: "50,000",
        image: "/Menu/Ramen.png",
        colorTheme: "red",
        tag: "名物" // Meibutsu (Specialty)
    },
    {
        id: 3,
        name: "Dragon Roll",
        jpName: "ドラゴンロール",
        description: "Premium sushi roll featuring eel, cucumber, and avocado with unagi sauce.",
        price: "47,000",
        image: "/Menu/Dragon_roll.png",
        colorTheme: "green",
        tag: "新鮮" // Shinsen (Fresh)
    },
    {
        id: 4,
        name: "Virgin mojito",
        jpName: "バージンモヒート",
        description: "Refreshing mocktail with muddled mint, fresh lime, and sparkling soda.",
        price: "25,800",
        image: "/Menu/Virgin_mojito.png",
        colorTheme: "green",
        tag: "爽やか" // Sawayaka (Refreshing)
    },
    {
        id: 5,
        name: "Matcha Milk tea",
        jpName: "抹茶ミルクティー",
        description: "Premium ceremonial grade matcha blended with creamy milk and tapioca pearls.",
        price: "55,000",
        image: "/Menu/Matcha_Milk_tea.png",
        colorTheme: "green",
        tag: "極上" // Gokujou (Premium)
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
        const rX = (y - centerY) / 20;
        const rY = (centerX - x) / 20;
        setRotateX(rX);
        setRotateY(rY);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };

    const bgColor = item.colorTheme === 'red' ? 'bg-[#3b0918]' : 'bg-[#122e1b]';
    const glowColor = item.colorTheme === 'red' ? 'bg-red-500/20' : 'bg-green-500/20';

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ rotateX, rotateY }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ transformStyle: "preserve-3d" }}
            className={`p-6 group cursor-pointer relative rounded-sm border-2 border-[#D4AF37] ${bgColor} w-full max-w-[360px] shadow-[0_10px_30px_rgba(0,0,0,0.8)]`}
        >
            {/* Inner Border to give traditional card look */}
            <div className="absolute inset-1 border border-[#D4AF37]/50 group-hover:border-[#D4AF37] transition-colors duration-500 pointer-events-none" />

            {/* Vertical Japanese Text (Left side) */}
            <div className="absolute left-3 top-16 bottom-16 w-8 flex flex-col justify-center items-center pointer-events-none opacity-80 z-20">
                <span className="text-[#D4AF37] font-serif text-xl tracking-[0.3em] writing-mode-vertical" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                    {item.jpName}
                </span>
            </div>

            <div style={{ transform: "translateZ(40px)" }} className="relative z-10 flex flex-col items-center pl-8">

                {/* Title badge */}
                <div className="bg-[#1a1a1a] border-t-2 border-b-2 border-[#D4AF37] px-6 py-2 mb-4 shadow-lg w-[110%] -ml-[10%] relative z-20 flex justify-center items-center">
                    <h3 className="text-xl font-bold uppercase text-white tracking-widest">{item.name}</h3>
                </div>

                {/* Main Image Frame */}
                <div className="relative h-48 w-full mb-6 overflow-hidden rounded-sm bg-[#0a0a0a] border border-[#D4AF37]/40 shadow-inner group-hover:border-[#D4AF37]/80 transition-colors">
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-4 group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl"
                    />
                    {/* Small Japanese Tag overlay */}
                    <div className="absolute top-2 right-2 bg-black/80 border border-[#D4AF37]/50 px-2 py-1">
                        <span className="text-[#D4AF37] text-xs writing-mode-vertical" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>{item.tag}</span>
                    </div>
                </div>

                <div className="space-y-4 text-center pb-2 w-full">
                    <p className="text-[#ccc] text-sm leading-relaxed h-[60px] flex items-center justify-center italic">"{item.description}"</p>

                    {/* Price Pill */}
                    <div className="inline-block mt-4 bg-gradient-to-r from-black via-[#1a1a1a] to-black border-y border-[#D4AF37] px-8 py-2 w-[120%] -ml-[10%] relative z-20 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                        <span className="text-[#D4AF37] font-black text-2xl tracking-wider">{item.price}</span>
                    </div>
                </div>
            </div>

            {/* Background Glow */}
            <div className={`absolute -inset-4 ${glowColor} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10`} />
        </motion.div>
    );
}

export function MenuSection() {
    return (
        <section id="menu" className="py-32 relative bg-[#050505] overflow-hidden">
            {/* Japanese Background Watermarks */}
            <div className="absolute inset-0 pointer-events-none font-serif opacity-[0.03] text-[#D4AF37] flex justify-between overflow-hidden">
                <div className="text-[15rem] leading-none whitespace-nowrap opacity-100" style={{ writingMode: 'vertical-rl', transform: 'translateX(-30%)' }}>
                    伝統芸術とうつ
                </div>
                <div className="text-[15rem] leading-none whitespace-nowrap opacity-100" style={{ writingMode: 'vertical-rl', transform: 'translateX(30%)' }}>
                    最高級の味わい
                </div>
            </div>

            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

            <div className="container px-4 mx-auto relative z-10">
                <div className="flex flex-col items-center mb-20 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-6 text-[#D4AF37] mb-2"
                    >
                        <div className="h-[2px] w-16 bg-gradient-to-r from-transparent to-[#D4AF37]" />
                        <span className="font-bold tracking-[0.4em] uppercase text-sm font-serif">
                            Tradition Meets Excellence
                        </span>
                        <div className="h-[2px] w-16 bg-gradient-to-l from-transparent to-[#D4AF37]" />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center"
                    >
                        <h2 className="text-7xl md:text-9xl font-black tracking-tighter uppercase text-center text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2B2] via-[#D4AF37] to-[#AA8222] filter drop-shadow-[0_5px_5px_rgba(0,0,0,1)] pb-2">
                            GM CAFE
                        </h2>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="text-[#D4AF37] text-2xl" style={{ writingMode: 'vertical-rl' }}>メニュー</span>
                            <h2 className="text-4xl md:text-6xl font-serif tracking-[0.2em] uppercase text-center text-white/90">
                                MENU
                            </h2>
                            <span className="text-[#D4AF37] text-2xl" style={{ writingMode: 'vertical-rl' }}>メニュー</span>
                        </div>
                    </motion.div>
                </div>

                <div className="flex flex-wrap justify-center gap-12 max-w-[1400px] mx-auto">
                    {/* Top Row items (2 items) */}
                    <div className="flex flex-col lg:flex-row justify-center gap-12 w-full lg:w-3/5">
                        {MENU_ITEMS.slice(0, 2).map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: index * 0.15 }}
                                className="flex justify-center w-full lg:w-1/2"
                            >
                                <MenuCard item={item} />
                            </motion.div>
                        ))}
                    </div>

                    {/* Bottom Row items (3 items) */}
                    <div className="flex flex-col lg:flex-row justify-center gap-12 w-full">
                        {MENU_ITEMS.slice(2, 5).map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: (index + 2) * 0.15 }}
                                className="flex justify-center lg:w-1/3"
                            >
                                <MenuCard item={item} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Border Element */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50" />
        </section>
    );
}
