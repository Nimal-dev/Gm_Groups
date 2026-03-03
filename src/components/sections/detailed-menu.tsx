'use client';

import { motion } from "framer-motion";

const MENU_ITEMS = {
    burgers: [
        { name: "Steahouse Supreme Burger", price: "$1,00,000", description: "Our signature classic. A mix of juicy chicken, bacon and steak patty, special sauce, lettuce, cheese, pickles, onions, ketchup on a sesame seed bun." },
        { name: "Ocean Catch Burger", price: "$1,00,000", description: "Our new seafood burger. Fresh from the ocean the burger is infused in fried fish patty and cheese and the delicacy is delicious!!" },
        { name: "The Cardiac Crusher", price: "$1,00,000", description: "Ready to stop your hearts! Introducing the new big burger with 3 beef pattys that can finish your hunger in a gif." },
        { name: "Sunrise Ham Melt Sandwich", price: "$1,00,000", description: "Double cheese, ham, and a fried egg. Not for the faint of heart." },
    ],
    sides: [
        { name: "Fries", price: "$1,00,000", description: "Crispy, salty, and perfect for sharing. Or not." },
    ],
    drinks: [
        { name: "E-Cola", price: "$1,00,000", description: "The classic taste of virtual refreshment." },
        { name: "Sprunk", price: "$1,00,000", description: "For when you need that extra green kick." },
    ],
};

export function DetailedMenu() {
    return (
        <section id="menu" className="py-24 sm:py-32 bg-black text-white">
            <div className="container px-4 mx-auto max-w-6xl">
                <div className="mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-center gap-4 mb-4"
                    >
                        <div className="w-12 h-[1px] bg-[#ff8c00]" />
                        <span className="text-sm font-bold tracking-[0.2em] text-[#ff8c00] uppercase">The Offerings</span>
                        <div className="w-12 h-[1px] bg-[#ff8c00]" />
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-6xl md:text-8xl font-black tracking-tighter uppercase"
                    >
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">OUR</span> <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ff8c00] to-[#cc5200]">MENU</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="max-w-2xl mx-auto mt-6 text-xl md:text-2xl font-light italic text-gray-400"
                    >
                        Simple, iconic, and dangerously good.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="grid gap-12 md:grid-cols-2 md:gap-16 pt-8"
                >
                    <div>
                        <div className="flex items-center gap-4 mb-8">
                            <h3 className="text-3xl font-black uppercase tracking-tight text-white">Burgers</h3>
                            <div className="h-[2px] bg-[#ff8c00] flex-grow opacity-50" />
                        </div>
                        <div className="space-y-6">
                            {MENU_ITEMS.burgers.map((item) => (
                                <div key={item.name} className="p-6 rounded-xl bg-[#0f0f0f] border border-white/5 hover:border-[#ff8c00]/30 transition-colors">
                                    <div className="flex items-baseline justify-between w-full mb-3">
                                        <span className="text-lg font-bold text-white uppercase tracking-wide">{item.name}</span>
                                        <div className="flex-grow mx-4 border-b border-dotted border-gray-600/50" />
                                        <span className="text-lg font-bold text-[#ff8c00]">{item.price}</span>
                                    </div>
                                    <p className="text-sm text-gray-400 font-light leading-relaxed">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-12">
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <h3 className="text-3xl font-black uppercase tracking-tight text-white">Sides</h3>
                                <div className="h-[2px] bg-[#ff8c00] flex-grow opacity-50" />
                            </div>
                            <div className="space-y-6">
                                {MENU_ITEMS.sides.map((item) => (
                                    <div key={item.name} className="p-6 rounded-xl bg-[#0f0f0f] border border-white/5 hover:border-[#ff8c00]/30 transition-colors">
                                        <div className="flex items-baseline justify-between w-full mb-3">
                                            <span className="text-lg font-bold text-white uppercase tracking-wide">{item.name}</span>
                                            <div className="flex-grow mx-4 border-b border-dotted border-gray-600/50" />
                                            <span className="text-lg font-bold text-[#ff8c00]">{item.price}</span>
                                        </div>
                                        <p className="text-sm text-gray-400 font-light leading-relaxed">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <h3 className="text-3xl font-black uppercase tracking-tight text-white">Drinks</h3>
                                <div className="h-[2px] bg-[#ff8c00] flex-grow opacity-50" />
                            </div>
                            <div className="space-y-6">
                                {MENU_ITEMS.drinks.map((item) => (
                                    <div key={item.name} className="p-6 rounded-xl bg-[#0f0f0f] border border-white/5 hover:border-[#ff8c00]/30 transition-colors">
                                        <div className="flex items-baseline justify-between w-full mb-3">
                                            <span className="text-lg font-bold text-white uppercase tracking-wide">{item.name}</span>
                                            <div className="flex-grow mx-4 border-b border-dotted border-gray-600/50" />
                                            <span className="text-lg font-bold text-[#ff8c00]">{item.price}</span>
                                        </div>
                                        <p className="text-sm text-gray-400 font-light leading-relaxed">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
