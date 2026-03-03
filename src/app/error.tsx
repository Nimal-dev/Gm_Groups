'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0000] text-white px-4 relative overflow-hidden">
            {/* Glitchy/Red Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-900/10 blur-[120px] rounded-full z-0" />

            <div className="relative z-10 text-center space-y-8 max-w-2xl px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="w-20 h-20 bg-red-600/20 border border-red-600/50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <span className="text-red-500 font-black tracking-[0.3em] uppercase text-sm mb-4 block px-4 border-l-2 border-red-600 mx-auto w-fit">
                        System Failure
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-4">
                        COMMAND <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-950 text-white">FAILED</span>
                    </h1>
                    <p className="text-xl text-zinc-500 font-light italic mb-8">
                        "Even the most meticulous plans hit a snag. Let's try rebooting the operation."
                    </p>
                    {process.env.NODE_ENV === 'development' && (
                        <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-lg text-left mb-8 overflow-auto max-h-40">
                            <code className="text-xs text-red-400 font-mono">{error.message}</code>
                        </div>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    <Button
                        onClick={() => reset()}
                        size="lg"
                        className="h-14 px-10 bg-red-600 hover:bg-white hover:text-black text-white font-black uppercase tracking-wider rounded-none skew-x-[-12deg] transition-all duration-300 group"
                    >
                        <div className="flex items-center gap-3 skew-x-[12deg]">
                            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                            <span>Retry Operation</span>
                        </div>
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
