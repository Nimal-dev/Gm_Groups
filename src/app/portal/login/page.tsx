'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { portalMpinLogin } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Home, UserRound, KeyRound, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFormStatus } from 'react-dom';
import { InputOTP } from '@/components/ui/input-otp';

export default function PortalLoginPage() {
    // @ts-ignore
    const [state, dispatch] = useActionState(portalMpinLogin, undefined);
    const [mpin, setMpin] = useState('');
    const formRef = useRef<HTMLFormElement>(null);

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

    useEffect(() => {
        if (mpin.length === 4) {
            formRef.current?.requestSubmit();
        }
    }, [mpin]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-[url('/gm_wallpaper.jpg')] bg-cover bg-center md:bg-black/90 relative overflow-hidden">
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>

            {/* Background animated blobs */}
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
                        <div className="min-h-[180px]">
                            <motion.div
                                key="mpin-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                            >
                                <form ref={formRef} action={dispatch} className="space-y-4">
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
                                        <div className="space-y-3 relative group">
                                            <Label htmlFor="mpin" className="text-xs text-white/70 uppercase tracking-wider pl-1">Secure MPIN</Label>
                                            <div className="relative flex justify-center py-2">
                                                <input type="hidden" name="mpin" value={mpin} />
                                                <InputOTP 
                                                    value={mpin}
                                                    onChange={setMpin}
                                                    maxLength={4}
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
