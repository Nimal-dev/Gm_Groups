'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Sparkles, X } from 'lucide-react';

type IntroStep = 'words' | 'old_manager' | 'cracking' | 'breaking' | 'arya' | 'exit';

// Festive Confetti Particles
const CONFETTI_PIECES = Array.from({ length: 45 }).map((_, i) => ({
    id: i,
    x: (i * 2.2) % 100, // percentage horizontal spread
    y: -10 - (i % 8) * 12,
    size: (i % 3) === 0 ? 12 : (i % 3) === 1 ? 8 : 16,
    color: ['#D4AF37', '#FFD700', '#FFF5C0', '#FF80AB', '#60A5FA', '#34D399', '#F59E0B'][i % 7],
    rotation: (i * 37) % 360,
    delay: (i % 15) * 0.12,
    duration: 3 + (i % 5) * 0.5,
}));

export function Preloader() {
    const [isLoading, setIsLoading] = useState(true);
    const [step, setStep] = useState<IntroStep>('words');
    const [wordIndex, setWordIndex] = useState(0);

    const WORDS = ['MEET', 'OUR', 'NEW', 'MANAGER'];

    const handleSkip = useCallback(() => {
        setStep('exit');
        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    }, []);

    // Listen for Escape key to skip anytime
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleSkip();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSkip]);

    useEffect(() => {
        // --- Master Animation Timeline (Plays on every reload) ---
        const timers: NodeJS.Timeout[] = [];

        // 1. Words Sequence: MEET -> OUR -> NEW -> MANAGER
        timers.push(setTimeout(() => setWordIndex(1), 500));   // "OUR"
        timers.push(setTimeout(() => setWordIndex(2), 1000));  // "NEW"
        timers.push(setTimeout(() => setWordIndex(3), 1500));  // "MANAGER"

        // 2. Old Manager Introduction
        timers.push(setTimeout(() => setStep('old_manager'), 2400));

        // 3. Crack lines begin creeping across photo
        timers.push(setTimeout(() => setStep('cracking'), 3600));

        // 4. Breaking shards & light flare
        timers.push(setTimeout(() => setStep('breaking'), 4800));

        // 5. Arya emerges in full glory + Big Cursive "Arya"
        timers.push(setTimeout(() => setStep('arya'), 5400));

        // 6. Hold Arya for 3 full seconds (5400ms + 3000ms = 8400ms), then exit
        timers.push(setTimeout(() => {
            setStep('exit');
            setTimeout(() => {
                setIsLoading(false);
            }, 600);
        }, 8400));

        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    key="manager-intro"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)', transition: { duration: 0.6 } }}
                    className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#070707] text-white overflow-hidden select-none font-sans"
                >
                    {/* Universal font styling with cursive fallbacks */}
                    <style
                        dangerouslySetInnerHTML={{
                            __html: `
                                @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
                                .font-cursive-arya {
                                    font-family: 'Great Vibes', 'Brush Script MT', 'Dancing Script', 'Segoe Script', cursive;
                                }
                            `,
                        }}
                    />

                    {/* Ambient Background Glow */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'radial-gradient(circle at center, rgba(212,175,55,0.18) 0%, rgba(0,0,0,0.85) 60%, #050505 100%)',
                        }}
                    />

                    {/* Floating Celebratory Confetti (visible throughout) */}
                    {(step === 'arya' || step === 'breaking' || step === 'words') && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
                            {CONFETTI_PIECES.map((p) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ y: `${p.y}vh`, x: `${p.x}vw`, rotate: p.rotation, opacity: 0 }}
                                    animate={{
                                        y: ['0vh', '110vh'],
                                        x: [`${p.x}vw`, `${p.x + (p.id % 2 === 0 ? 5 : -5)}vw`],
                                        rotate: p.rotation + 720,
                                        opacity: [0, 1, 1, 0],
                                    }}
                                    transition={{
                                        duration: p.duration,
                                        delay: p.delay,
                                        repeat: Infinity,
                                        ease: 'linear',
                                    }}
                                    style={{
                                        width: p.size,
                                        height: p.size * (p.id % 2 === 0 ? 0.6 : 1),
                                        backgroundColor: p.color,
                                        borderRadius: p.id % 4 === 0 ? '50%' : '2px',
                                        boxShadow: `0 0 8px ${p.color}`,
                                    }}
                                    className="absolute"
                                />
                            ))}
                        </div>
                    )}

                    {/* Skip Button (Top Right) */}
                    <motion.button
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        onClick={handleSkip}
                        className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold uppercase tracking-wider backdrop-blur-md text-zinc-300 hover:text-white transition-all shadow-lg group cursor-pointer"
                    >
                        <span>Skip Intro</span>
                        <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
                    </motion.button>

                    {/* PHASE 1: Sequential Dramatic Words (MEET -> OUR -> NEW -> MANAGER) */}
                    {step === 'words' && (
                        <div className="relative z-20 flex flex-col items-center justify-center px-4 text-center">
                            {/* Subtle Brand Tag */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 mb-6"
                            >
                                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                                <span className="text-amber-400 text-xs tracking-[0.4em] uppercase font-bold">
                                    GM Groups Announcement
                                </span>
                                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                            </motion.div>

                            {/* Sequential Word Slam */}
                            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 min-h-[120px]">
                                {WORDS.slice(0, wordIndex + 1).map((word, idx) => {
                                    const isManager = word === 'MANAGER';
                                    return (
                                        <motion.span
                                            key={word}
                                            initial={{ scale: 3, opacity: 0, y: -30, filter: 'blur(12px)' }}
                                            animate={{ scale: 1, opacity: 1, y: 0, filter: 'blur(0px)' }}
                                            transition={{ type: 'spring', damping: 14, stiffness: 180 }}
                                            className={`text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter ${
                                                isManager
                                                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 drop-shadow-[0_0_35px_rgba(245,158,11,0.8)]'
                                                    : 'text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]'
                                            }`}
                                        >
                                            {word}
                                        </motion.span>
                                    );
                                })}
                            </div>

                            {/* Celebratory subtitle */}
                            {wordIndex >= 3 && (
                                <motion.p
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="mt-6 text-zinc-400 tracking-[0.25em] uppercase text-xs font-semibold"
                                >
                                    A New Era Begins
                                </motion.p>
                            )}
                        </div>
                    )}

                    {/* PHASE 2 & 3: Old Manager Photo Appearing and Slowly Cracking */}
                    {(step === 'old_manager' || step === 'cracking' || step === 'breaking') && (
                        <div className="relative z-20 flex flex-col items-center">
                            {/* Headline */}
                            <motion.div
                                initial={{ opacity: 0, y: -15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 text-center"
                            >
                                <span className="text-zinc-500 text-xs uppercase tracking-[0.3em] font-semibold">
                                    Outgoing Leadership
                                </span>
                                <h3 className="text-xl sm:text-2xl font-bold text-zinc-300 tracking-wide">
                                    Nimal Prince • The Manager
                                </h3>
                            </motion.div>

                            {/* Portrait Container with Cracking & Shattering */}
                            <motion.div
                                initial={{ scale: 0.85, opacity: 0, y: 20 }}
                                animate={
                                    step === 'cracking'
                                        ? {
                                              scale: 1,
                                              opacity: 1,
                                              y: 0,
                                              x: [-2, 2, -3, 3, -1, 1, 0], // Subtle shaking as glass fractures
                                              transition: { x: { repeat: Infinity, duration: 0.25 } },
                                          }
                                        : step === 'breaking'
                                        ? {
                                              scale: 1.15,
                                              opacity: 0,
                                              rotate: 6,
                                              filter: 'blur(8px)',
                                              transition: { duration: 0.5 },
                                          }
                                        : { scale: 1, opacity: 1, y: 0 }
                                }
                                className="relative w-[280px] h-[370px] sm:w-[320px] sm:h-[420px] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-zinc-900"
                            >
                                {/* Old Manager Photo */}
                                <Image
                                    src="/Nimal.png"
                                    alt="Nimal Prince - Old Manager"
                                    fill
                                    priority
                                    unoptimized
                                    className="object-cover contrast-110 filter brightness-95"
                                />

                                {/* Dark overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                                {/* Realistic SVG Spiderweb Cracks Layer */}
                                {(step === 'cracking' || step === 'breaking') && (
                                    <div className="absolute inset-0 z-30 pointer-events-none">
                                        <svg className="w-full h-full" viewBox="0 0 320 420" fill="none">
                                            {/* Primary Impact Center Fracture Lines */}
                                            <motion.path
                                                d="M160,200 L140,150 L90,110 L50,60 M140,150 L170,100 L160,30 M160,200 L200,160 L240,120 L280,70 M200,160 L230,220 L270,240 L310,230 M160,200 L180,260 L210,310 L260,360 M180,260 L140,310 L120,380 M160,200 L110,240 L70,270 L30,280 M110,240 L80,180 L40,150"
                                                stroke="#FFFFFF"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 1 }}
                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.9))' }}
                                            />
                                            {/* Secondary Branch Cracks */}
                                            <motion.path
                                                d="M140,150 L110,130 L90,80 M170,100 L210,80 L250,50 M200,160 L220,130 L200,90 M230,220 L270,200 L300,180 M180,260 L190,320 L230,370 M140,310 L150,370 L140,410 M110,240 L100,290 L70,340 M80,180 L60,190 L20,210"
                                                stroke="#FFD700"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 0.9 }}
                                                transition={{ duration: 1.0, delay: 0.2, ease: 'easeOut' }}
                                                style={{ filter: 'drop-shadow(0 0 5px rgba(255,215,0,0.8))' }}
                                            />
                                            {/* Micro Fissures */}
                                            <motion.path
                                                d="M160,200 L150,180 M150,180 L130,190 M160,200 L175,220 M175,220 L190,210 M160,200 L145,215 M140,150 L160,130 M240,120 L230,100 M210,310 L230,320"
                                                stroke="#FFFFFF"
                                                strokeWidth="1"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.4 }}
                                            />
                                        </svg>

                                        {/* Golden Light Bursting from Fractures */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: [0, 0.7, 1], scale: [0.8, 1.2, 1.6] }}
                                            transition={{ duration: 1.1, ease: 'easeInOut' }}
                                            style={{
                                                background: 'radial-gradient(circle at center, rgba(251,191,36,0.5) 0%, rgba(251,191,36,0.15) 50%, transparent 80%)',
                                            }}
                                            className="absolute inset-0 mix-blend-screen"
                                        />
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}

                    {/* PHASE 4: Explosive Golden Flash During Shatter */}
                    {step === 'breaking' && (
                        <motion.div
                            initial={{ scale: 0.3, opacity: 0 }}
                            animate={{ scale: [0.5, 3], opacity: [0, 1, 0] }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="absolute z-40 w-96 h-96 rounded-full bg-gradient-to-r from-amber-300 via-yellow-100 to-white blur-3xl pointer-events-none"
                        />
                    )}

                    {/* PHASE 5: NEW MANAGER ARYA REVEAL (Held for 3 Seconds) */}
                    {step === 'arya' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.7, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: 'spring', damping: 16, stiffness: 120, duration: 0.8 }}
                            className="relative z-40 flex flex-col items-center justify-center text-center px-4"
                        >
                            {/* Radiant Golden Backlight Halo */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.12, 1],
                                    opacity: [0.5, 0.8, 0.5],
                                }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                                style={{
                                    background: 'radial-gradient(circle at center, rgba(251,191,36,0.35) 0%, rgba(245,158,11,0.15) 50%, transparent 80%)',
                                }}
                                className="absolute -inset-10 blur-3xl rounded-full -z-10"
                            />

                            {/* Celebratory Tag */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="flex items-center gap-3 px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border border-amber-400/50 backdrop-blur-md mb-4 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                            >
                                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                                <span className="text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-[0.35em]">
                                    Introducing Our New Manager
                                </span>
                                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                            </motion.div>

                            {/* Arya Portrait Card */}
                            <motion.div
                                initial={{ scale: 0.8, rotate: -3 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', damping: 14, stiffness: 100 }}
                                className="relative w-[240px] h-[320px] sm:w-[280px] sm:h-[380px] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.5)] border-4 border-amber-400/60 bg-gradient-to-b from-amber-400/20 to-black group"
                            >
                                <Image
                                    src="/Arya.png"
                                    alt="Arya - The New Manager"
                                    fill
                                    priority
                                    unoptimized
                                    className="object-cover object-top contrast-110"
                                />
                                {/* Bottom vignette */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                {/* Gold border sheen */}
                                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-amber-200/40 pointer-events-none" />
                            </motion.div>

                            {/* BIG CURSIVE "Arya" NAME */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.6, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 0.25, duration: 0.7, type: 'spring', damping: 12 }}
                                className="mt-3 relative"
                            >
                                <h1
                                    style={{
                                        fontFamily: "'Great Vibes', 'Brush Script MT', 'Dancing Script', 'Segoe Script', cursive",
                                    }}
                                    className="font-cursive-arya text-7xl sm:text-8xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-[#FFF9D2] via-[#E8BE53] to-[#FFF0A0] filter drop-shadow-[0_0_35px_rgba(232,190,83,0.85)] tracking-wide leading-tight px-4"
                                >
                                    Arya
                                </h1>
                            </motion.div>

                            {/* Title & Celebration Subtitle */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45, duration: 0.5 }}
                                className="flex flex-col items-center mt-[-0.5rem]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-amber-400" />
                                    <span className="text-amber-400 font-extrabold uppercase tracking-[0.4em] text-xs sm:text-sm">
                                        The Manager
                                    </span>
                                    <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-amber-400" />
                                </div>
                                <span className="text-zinc-400 text-xs tracking-[0.25em] font-light mt-1 uppercase">
                                    GM Groups • Executive Leadership
                                </span>
                            </motion.div>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
