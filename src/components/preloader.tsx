'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

export function Preloader() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if preloader has already been shown in this session
        const hasSeenPreloader = sessionStorage.getItem('gm_v2_hasSeenPreloader');
        
        if (hasSeenPreloader) {
            setIsLoading(false);
            return; // Skip the animation entirely
        }

        // Hide the preloader after a short delay and mark as seen for the session
        const timer = setTimeout(() => {
            setIsLoading(false);
            sessionStorage.setItem('gm_v2_hasSeenPreloader', 'true');
        }, 3800); // slightly longer to let all animations play out

        return () => clearTimeout(timer);
    }, []);

    // Animation Variants
    const containerVariants: Variants = {
        hidden: { opacity: 1 },
        exit: {
            scale: 1.5,
            opacity: 0,
            transition: {
                duration: 0.8,
                ease: "easeInOut",
            },
        },
    };

    const lineVariants: Variants = {
        hidden: { width: "0%", opacity: 0 },
        visible: {
            width: "100%",
            opacity: [0, 1, 1, 0],
            transition: { duration: 1.5, ease: "easeInOut" },
        },
    };

    const textContainerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 1.2, // Wait for line to start exiting
            },
        },
    };

    const gmGroupsVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" },
        },
    };

    const letterVariants: Variants = {
        hidden: { opacity: 0, scale: 2, y: -50, filter: "blur(10px)" },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    key="preloader"
                    variants={containerVariants}
                    initial="hidden"
                    exit="exit"
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden"
                >
                    {/* Glowing Line */}
                    <motion.div
                        variants={lineVariants}
                        initial="hidden"
                        animate="visible"
                        className="absolute top-1/2 left-0 h-[2px] bg-primary shadow-[0_0_15px_rgba(255,165,0,0.8)]"
                    />

                    <motion.div
                        variants={textContainerVariants}
                        initial="hidden"
                        animate="visible"
                        className="relative flex flex-col items-center z-10"
                    >
                        {/* Welcome to Text */}
                        <motion.div
                            variants={gmGroupsVariants}
                            className="text-lg md:text-xl font-medium text-white/60 mb-2"
                        >
                            Welcome to
                        </motion.div>

                        {/* Small GM Groups Text */}
                        <motion.div
                            variants={gmGroupsVariants}
                            className="text-2xl md:text-3xl font-semibold text-white/80 tracking-[0.2em] uppercase mb-[-1rem] md:mb-[-2rem] drop-shadow-lg z-20"
                        >
                            GM Groups
                        </motion.div>

                        {/* Massive V2 Text with strong Glow */}
                        <div className="flex text-[8rem] md:text-[15rem] font-black tracking-tighter drop-shadow-[0_0_35px_rgba(255,100,0,0.5)] z-10">
                            {['V', '2'].map((char, i) => (
                                <motion.span
                                    key={i}
                                    variants={letterVariants}
                                    className="inline-block relative text-transparent bg-clip-text bg-gradient-to-br from-primary via-orange-400 to-red-600"
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
