'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full z-0" />

            <div className="relative z-10 text-center space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="text-primary font-black tracking-[0.3em] uppercase text-sm mb-4 block px-4 border-l-2 border-primary mx-auto w-fit">
                        Error 404
                    </span>
                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-none mb-4">
                        LOST IN <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-primary to-yellow-700">XLANTIS</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-zinc-500 font-light max-w-lg mx-auto italic">
                        "Even the most dominant players occasionally lose their way."
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Button asChild size="lg" className="h-14 px-8 bg-primary hover:bg-white text-black font-black uppercase tracking-wider rounded-none skew-x-[-12deg] transition-all duration-300">
                        <Link href="/" className="flex items-center gap-2">
                            <Home className="w-5 h-5 skew-x-[12deg]" />
                            <span className="skew-x-[12deg]">Return Home</span>
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-14 px-8 border-white/20 hover:border-primary text-white font-bold uppercase tracking-wider rounded-none skew-x-[-12deg] transition-all duration-300">
                        <button onClick={() => window.history.back()} className="flex items-center gap-2">
                            <ArrowLeft className="w-5 h-5 skew-x-[12deg]" />
                            <span className="skew-x-[12deg]">Go Back</span>
                        </button>
                    </Button>
                </motion.div>
            </div>

            {/* Decorative lines */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent opacity-50" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent opacity-50" />
        </div>
    );
}
