'use client';

import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { discordLogin } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Home } from 'lucide-react';
import { motion } from 'framer-motion';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// ...

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}

function LoginForm() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut" as const,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-[url('/gm_wallpaper.jpg')] bg-cover bg-center md:bg-black/90 relative overflow-hidden">
            {/* ... Background elements ... */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse z-0"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px] animate-pulse z-0 hidden md:block"></div>

            <Link
                href="/"
                className="absolute top-6 left-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors z-20 group"
            >
                <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all">
                    <Home className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">Return Home</span>
            </Link>

            <motion.div
                className="z-10 w-full max-w-sm px-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <Card className="glass-card border border-white/10 shadow-2xl backdrop-blur-xl bg-black/40">
                    <CardHeader className="space-y-2 pb-6">
                        {/* ... Header content ... */}
                        <motion.div
                            className="flex justify-center mb-2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                        >
                            <div className="p-4 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-blue-500/20 border border-white/10 shadow-lg group">
                                <Lock className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                            </div>
                        </motion.div>
                        <CardTitle className="text-3xl text-center font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-center text-white/50 text-sm">
                            Access via Discord
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <form action={discordLogin}>
                            <input type="hidden" name="callbackUrl" value={callbackUrl} />
                            <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <DiscordButton />
                            </motion.div>
                        </form>
                    </CardContent>
                </Card>
                <motion.p
                    variants={itemVariants}
                    className="text-center text-xs text-white/30 mt-8"
                >
                    &copy; 2026 GM Groups. Secure Access Only.
                    Nimal Prince
                </motion.p>
            </motion.div>
        </div>
    );
}

function DiscordButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium shadow-lg h-10 flex items-center justify-center gap-2 transition-all"
            type="submit"
            disabled={pending}
        >
            {pending ? (
                <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Connecting...</span>
                </>
            ) : (
                <>
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.772-.6083 1.1588a18.2915 18.2915 0 00-5.4925 0 12.636 12.636 0 00-.6165-1.1588.0776.0776 0 00-.0787-.0371 19.7363 19.7363 0 00-4.8853 1.5151.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561 20.0304 20.0304 0 005.9937 3.0335.0777.0777 0 00.0842-.0276c.4616-.6268.8687-1.291 1.2227-1.9961a.076.076 0 00-.0416-.1057 13.1141 13.1141 0 01-1.8716-.8913.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.6982.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286 20.0792 20.0792 0 006.0028-3.0345.077.077 0 00.0322-.0543c.4236-4.2763-.42-8.5414-3.528-12.7937a.074.074 0 00-.032-.0278zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
                    </svg>
                    Login with Discord
                </>
            )}
        </Button>
    );
}
