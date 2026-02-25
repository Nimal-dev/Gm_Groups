'use client';

import { useState, useEffect } from 'react';
import { clockIn, clockOut, getDutyStatus } from '@/actions/duty';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Clock, Play, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from 'framer-motion';

export function DutyControl() {
    const { toast } = useToast();
    const [status, setStatus] = useState<'LOADING' | 'OFF_DUTY' | 'ON_DUTY'>('LOADING');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState<string>('00h 00m 00s');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === 'ON_DUTY' && startTime) {
            interval = setInterval(() => {
                const now = Date.now();
                const diff = now - startTime;
                const hours = Math.floor(diff / 3600000);
                const minutes = Math.floor((diff % 3600000) / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setElapsed(`${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
            }, 1000);
        } else {
            setElapsed('00h 00m 00s');
        }
        return () => clearInterval(interval);
    }, [status, startTime]);

    const fetchStatus = async () => {
        const res = await getDutyStatus();
        if (res.success) {
            setStatus(res.isOnDuty ? 'ON_DUTY' : 'OFF_DUTY');
            setStartTime(res.startTime || null);
        }
    };

    const handleClockIn = async () => {
        setLoading(true);
        const res = await clockIn();
        setLoading(false);
        if (res.success) {
            toast({ title: "Clocked In", description: "You are now on duty.", className: "bg-green-600 border-none text-white" });
            fetchStatus();
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        }
    };

    const handleClockOut = async () => {
        setLoading(true);
        const res = await clockOut();
        setLoading(false);
        if (res.success) {
            const duration = formatDuration(res.durationMs!);
            toast({ title: "Clocked Out", description: `You were on duty for ${duration}.`, className: "bg-blue-600 border-none text-white" });
            fetchStatus();
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        }
    };

    const formatDuration = (ms: number) => {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    };

    if (status === 'LOADING') return <div className="h-[72px] animate-pulse bg-white/10 rounded-xl w-full mb-4"></div>;

    return (
        <motion.div
            animate={{
                borderColor: status === 'ON_DUTY' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                boxShadow: status === 'ON_DUTY' ? '0 0 20px rgba(34, 197, 94, 0.15)' : '0 0 0px rgba(0,0,0,0)'
            }}
            transition={{ duration: 0.5 }}
            className={cn(
                "flex items-center justify-between p-3 rounded-xl border bg-black/40 backdrop-blur-md mb-4 relative overflow-hidden group transition-colors",
                status === 'ON_DUTY' && "bg-green-950/20"
            )}
        >
            {/* Background animated pulse if on duty */}
            {status === 'ON_DUTY' && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/5 rounded-xl pointer-events-none"
                />
            )}

            <div className="flex items-center gap-2 sm:gap-3 relative z-10 min-w-0">
                <div className="relative shrink-0">
                    <motion.div
                        animate={status === 'ON_DUTY' ? { rotate: 360 } : { rotate: 0 }}
                        transition={status === 'ON_DUTY' ? { duration: 8, ease: "linear", repeat: Infinity } : {}}
                        className={cn("p-2.5 rounded-full flex items-center justify-center relative z-10", status === 'ON_DUTY' ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.5)]" : "bg-red-500/20 text-red-500")}
                    >
                        <Clock className="w-5 h-5" />
                    </motion.div>
                </div>

                <div className="flex flex-col min-w-0">
                    <h4 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider truncate">
                        {status === 'ON_DUTY' ? (
                            <span className="text-green-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]">Active Shift</span>
                        ) : (
                            <span className="text-muted-foreground">Off Duty</span>
                        )}
                    </h4>
                    <motion.p
                        key={status} // restart animation on status change
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "text-xs font-mono mt-0.5 truncate",
                            status === 'ON_DUTY' ? "text-white font-bold tracking-widest" : "text-muted-foreground"
                        )}
                    >
                        {status === 'ON_DUTY' ? elapsed : 'Ready to work?'}
                    </motion.p>
                </div>
            </div>

            <div className="relative z-10 shrink-0 ml-2">
                <AnimatePresence mode="wait">
                    {status === 'OFF_DUTY' ? (
                        <motion.div
                            key="clock-in"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Button
                                size="sm"
                                onClick={handleClockIn}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-500 text-white font-bold border-0 shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] transition-all h-8 px-3 text-xs"
                            >
                                <Play className="w-3 h-3 mr-1" /> Clock In
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="clock-out"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        disabled={loading}
                                        variant="destructive"
                                        className="font-bold h-8 px-3 text-xs hover:bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all"
                                    >
                                        <Square className="w-3 h-3 mr-1 fill-current" /> Clock Out
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="glass-card border border-white/10 bg-black/95 text-white shadow-2xl shadow-red-900/20">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-xl text-red-500 flex items-center gap-2">
                                            <Square className="w-5 h-5 fill-current" /> End Shift?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-400 text-base">
                                            Are you sure you want to clock out? This will stop your <strong className="text-white">Active Shift</strong> timer and log your session duration to the leaderboard.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="mt-4">
                                        <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/10 text-white hover:text-white">Keep Working</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleClockOut} className="bg-red-600 hover:bg-red-500 text-white border-none shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                                            Yes, Clock Out
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
