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

    if (status === 'LOADING') return <div className="h-10 animate-pulse bg-white/10 rounded w-full"></div>;

    return (
        <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm mb-4">
            <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-full", status === 'ON_DUTY' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                    <Clock className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-sm">{status === 'ON_DUTY' ? 'On Duty' : 'Off Duty'}</h4>
                    <p className="text-xs font-mono text-muted-foreground">{status === 'ON_DUTY' ? elapsed : 'Ready to work?'}</p>
                </div>
            </div>

            {status === 'OFF_DUTY' ? (
                <Button
                    size="sm"
                    onClick={handleClockIn}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white border-none"
                >
                    <Play className="w-4 h-4 mr-2" /> Clock In
                </Button>
            ) : (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            size="sm"
                            disabled={loading}
                            variant="destructive"
                        >
                            <Square className="w-3 h-3 mr-2 fill-current" /> Clock Out
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-card border border-white/10 bg-black/90 text-white">
                        <AlertDialogHeader>
                            <AlertDialogTitle>End Shift?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                                Are you sure you want to clock out? This will stop your timer and log your session duration.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/10 text-white hover:text-white">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClockOut} className="bg-red-600 hover:bg-red-700 text-white border-none">
                                Yes, Clock Out
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
}
