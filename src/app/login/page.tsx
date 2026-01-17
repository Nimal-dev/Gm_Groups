'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined);
    const [showPassword, setShowPassword] = useState(false);

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
            {/* Overlay for better text readability if bg image is used */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>

            {/* Background animated blobs for modern feel */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse z-0"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px] animate-pulse z-0 hidden md:block"></div>

            <motion.div
                className="z-10 w-full max-w-sm px-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <Card className="glass-card border border-white/10 shadow-2xl backdrop-blur-xl bg-black/40">
                    <CardHeader className="space-y-2 pb-6">
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
                            Enter your credentials to access the command center
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={dispatch} className="space-y-5">
                            <motion.div variants={itemVariants} className="space-y-2">
                                <div className="relative group">
                                    <div className="absolute left-3 top-3 text-white/40 group-focus-within:text-purple-400 transition-colors">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <Input
                                        type="text"
                                        name="username"
                                        placeholder="Username"
                                        required
                                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:ring-purple-500/20 h-10 transition-all duration-300"
                                    />
                                </div>
                            </motion.div>
                            <motion.div variants={itemVariants} className="space-y-2">
                                <div className="relative group">
                                    <div className="absolute left-3 top-3 text-white/40 group-focus-within:text-purple-400 transition-colors">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Password"
                                        required
                                        minLength={6}
                                        className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:ring-purple-500/20 h-10 transition-all duration-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-white/40 hover:text-white transition-colors focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </motion.div>

                            {errorMessage && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium"
                                >
                                    {errorMessage}
                                </motion.div>
                            )}

                            <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <LoginButton />
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

function LoginButton() {
    const { pending } = useFormStatus();

    return (
        <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium shadow-lg hover:shadow-purple-500/20 transition-all duration-300 h-10" aria-disabled={pending}>
            {pending ? (
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Verifying...</span>
                </div>
            ) : (
                'Sign In'
            )}
        </Button>
    );
}
