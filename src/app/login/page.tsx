'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import { discordLogin, mpinLogin } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Home, UserRound, KeyRound, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormStatus } from 'react-dom';

export default function LoginPage() {
    const [loginMethod, setLoginMethod] = useState<'mpin' | 'discord'>('mpin');
    
    // @ts-ignore
    const [state, dispatch] = useActionState(mpinLogin, undefined);

    const containerVariants: any = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
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
            {/* Overlay for better text readability if bg image is used */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>

            {/* Background animated blobs for modern feel */}
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
                <Card className="glass-card border border-white/10 shadow-2xl backdrop-blur-xl bg-black/40 relative overflow-hidden">
                    <CardHeader className="space-y-2 pb-6 relative z-10">
                        <motion.div
                            className="flex justify-center mb-2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                        >
                            <div className="p-4 rounded-2xl bg-gradient-to-tr from-accent/40 to-blue-500/20 border border-white/10 shadow-lg group relative overflow-hidden">
                                <Lock className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300 relative z-10" />
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl" />
                            </div>
                        </motion.div>
                        <CardTitle className="text-3xl text-center font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                            Employee Portal
                        </CardTitle>
                        <CardDescription className="text-center text-white/50 text-sm">
                            Secure Access Terminal
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-5 relative z-10">
                        
                        {/* Method Toggle */}
                        <div className="flex p-1 bg-black/40 rounded-lg border border-white/5 mb-6">
                            <button
                                onClick={() => setLoginMethod('mpin')}
                                className={`flex-1 text-xs font-medium py-2 rounded-md transition-all ${loginMethod === 'mpin' ? 'bg-accent text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                            >
                                Login ID & MPIN
                            </button>
                            <button
                                onClick={() => setLoginMethod('discord')}
                                className={`flex-1 text-xs font-medium py-2 rounded-md transition-all ${loginMethod === 'discord' ? 'bg-[#5865F2] text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                            >
                                Discord OAuth
                            </button>
                        </div>
                        
                        <div className="min-h-[180px]">
                            <AnimatePresence mode="wait">
                                {loginMethod === 'mpin' ? (
                                    <motion.div
                                        key="mpin-form"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.2, ease: "easeInOut" }}
                                    >
                                        <form action={dispatch} className="space-y-4">
                                            <div className="space-y-4">
                                                <div className="space-y-1.5 relative group">
                                                    <Label htmlFor="loginId" className="text-xs text-white/70 uppercase tracking-wider pl-1">Login ID</Label>
                                                    <div className="relative">
                                                        <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-accent transition-colors" />
                                                        <input 
                                                            id="loginId"
                                                            name="loginId"
                                                            type="text" 
                                                            required
                                                            placeholder="Enter your Login ID" 
                                                            className="flex h-11 w-full rounded-md border border-white/10 bg-black/30 px-10 text-sm focus-visible:outline-none focus:border-accent text-white transition-all group-hover:border-white/20"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5 relative group">
                                                    <Label htmlFor="mpin" className="text-xs text-white/70 uppercase tracking-wider pl-1">Secure MPIN</Label>
                                                    <div className="relative">
                                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-accent transition-colors" />
                                                        <Input 
                                                            id="mpin"
                                                            name="mpin"
                                                            type="password"
                                                            maxLength={4}
                                                            required
                                                            placeholder="••••" 
                                                            className="pl-10 text-center tracking-[0.5em] font-mono text-lg bg-black/30 border-white/10 focus-visible:ring-accent focus-visible:border-accent text-white h-11 transition-all group-hover:border-white/20"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {state?.error && (
                                                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-start gap-2 text-destructive text-sm mt-4 animate-in fade-in slide-in-from-top-2">
                                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                                    <p>{state.error}</p>
                                                </div>
                                            )}

                                            <MpinSubmitButton />
                                        </form>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="discord-form"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2, ease: "easeInOut" }}
                                        className="h-full flex flex-col justify-center gap-4 py-6"
                                    >
                                        <p className="text-sm text-center text-white/60 mb-2">
                                            Sign in with your Discord account to securely authenticate and access the dashboard.
                                        </p>
                                        <form action={discordLogin}>
                                            <DiscordButton />
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </CardContent>
                </Card>
                <motion.p
                    variants={itemVariants}
                    className="text-center text-xs text-white/30 mt-8 font-mono tracking-widest uppercase"
                >
                    GM Groups OS &copy; 2026
                </motion.p>
            </motion.div>
        </div>
    );
}

function MpinSubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button 
            className="w-full bg-accent hover:bg-accent/80 text-white font-medium shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] h-11 mt-6 transition-all"
            type="submit"
            disabled={pending}
        >
            {pending ? (
                <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Authenticating...
                </>
            ) : (
                'Access Terminal'
            )}
        </Button>
    );
}

function DiscordButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            className="w-full bg-black/40 border border-[#5865F2]/50 hover:bg-[#5865F2] hover:border-[#5865F2] text-white font-medium shadow-xl h-12 flex items-center justify-center gap-3 transition-all group"
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
                    <svg className="w-5 h-5 text-[#5865F2] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.772-.6083 1.1588a18.2915 18.2915 0 00-5.4925 0 12.636 12.636 0 00-.6165-1.1588.0776.0776 0 00-.0787-.0371 19.7363 19.7363 0 00-4.8853 1.5151.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561 20.0304 20.0304 0 005.9937 3.0335.0777.0777 0 00.0842-.0276c.4616-.6268.8687-1.291 1.2227-1.9961a.076.076 0 00-.0416-.1057 13.1141 13.1141 0 01-1.8716-.8913.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.6982.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286 20.0792 20.0792 0 006.0028-3.0345.077.077 0 00.0322-.0543c.4236-4.2763-.42-8.5414-3.528-12.7937a.074.074 0 00-.032-.0278zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
                    </svg>
                    Continue with Discord
                </>
            )}
        </Button>
    );
}
