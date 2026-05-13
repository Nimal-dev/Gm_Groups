'use client';

import { useState, useActionState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { vendorMpinLogin } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package, AlertCircle, UserRound, Home } from 'lucide-react';
import { InputOTP } from '@/components/ui/input-otp';
import { useFormStatus } from 'react-dom';

export default function VendorLoginPage() {
    // @ts-ignore
    const [state, formAction] = useActionState(vendorMpinLogin, { error: '' });
    const [mpin, setMpin] = useState('');
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (mpin.length === 4) {
            formRef.current?.requestSubmit();
        }
    }, [mpin]);

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[30%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[15%] w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[100px]" />
            </div>

            <Link
                href="/"
                className="absolute top-6 left-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors z-20 group"
            >
                <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all">
                    <Home className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-emerald-400">Return Home</span>
            </Link>

            <main className="flex-grow flex items-center justify-center px-4 py-12 relative z-10">
                <div className="w-full max-w-md">
                    <Card className="glass-card border-white/10 overflow-hidden shadow-2xl bg-black/40 backdrop-blur-xl rounded-2xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

                        <CardHeader className="text-center pb-4 pt-10">
                            <div className="mx-auto bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-5 backdrop-blur-sm border border-white/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                <Package className="w-8 h-8 text-emerald-400" />
                            </div>
                            <CardTitle className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-emerald-100 to-emerald-300">
                                Vendor Portal
                            </CardTitle>
                            <CardDescription className="text-sm text-emerald-200/60 mt-2 font-medium">
                                MLB & YKZ Supplier Dashboard
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="px-6 pb-8 md:px-8">
                            <form ref={formRef} action={formAction} className="space-y-5">
                                <div className="space-y-1.5 relative group">
                                    <Label htmlFor="vendorId" className="text-xs text-white/70 uppercase tracking-wider pl-1 font-medium">
                                        Vendor ID
                                    </Label>
                                    <div className="relative">
                                        <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
                                        <input
                                            id="vendorId"
                                            name="vendorId"
                                            type="text"
                                            required
                                            placeholder="Enter your Vendor ID"
                                            className="flex h-12 w-full rounded-xl border border-white/10 bg-black/30 px-10 text-sm focus-visible:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 text-white transition-all placeholder:text-white/20"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 relative group">
                                    <Label htmlFor="mpin" className="text-xs text-white/70 uppercase tracking-wider pl-1 font-medium flex justify-center">
                                        Secure MPIN
                                    </Label>
                                    <div className="relative flex justify-center py-2">
                                        <input type="hidden" name="mpin" value={mpin} />
                                        <InputOTP 
                                            value={mpin}
                                            onChange={setMpin}
                                            maxLength={4}
                                        />
                                    </div>
                                </div>

                                {state?.error && (
                                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span>{state.error}</span>
                                    </div>
                                )}

                                <SubmitButton />
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-xs text-white/30 tracking-wider uppercase font-mono">
                                    KOI Cafe Vendor System
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full h-12 mt-2 text-base font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white border-0 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300 rounded-xl"
        >
            {pending ? (
                <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Authenticating...
                </>
            ) : 'Sign In'}
        </Button>
    );
}
