'use client';

import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GamificationCard } from '@/components/dashboard/GamificationCard';
import { DutyControl } from '@/components/dashboard/DutyControl';

// Lazy Load heavy tab components
const FoodLogForm = dynamic(() => import('@/components/dashboard/FoodLogForm').then(mod => mod.FoodLogForm), {
    loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading Food Log...</div>,
    ssr: false
});
const InventoryManager = dynamic(() => import('@/components/dashboard/InventoryManager').then(mod => mod.InventoryManager), {
    loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading Inventory...</div>,
    ssr: false
});
const ReportsGenerator = dynamic(() => import('@/components/dashboard/ReportsGenerator').then(mod => mod.ReportsGenerator), {
    loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading Report Tool...</div>,
    ssr: false
});
const RawRequestForm = dynamic(() => import('@/components/dashboard/RawRequestForm').then(mod => mod.RawRequestForm), {
    loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading Raw Requests...</div>,
    ssr: false
});

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, RefreshCw, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface PortalDashboardClientProps {
    currentUser: any;
    userRole: string;
    activeStaff?: any[];
}

export function PortalDashboardClient({ currentUser, userRole, activeStaff = [] }: PortalDashboardClientProps) {
    return (
        <div className="w-full space-y-6">
            {/* Gamification / Level Display */}
            {currentUser && <GamificationCard user={currentUser} />}

            <Tabs defaultValue="duty" className="space-y-6">
                <div className="overflow-x-auto pb-2">
                    <TabsList className="glass-card bg-transparent border-0 p-1 w-max">
                        <TabsTrigger value="duty" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Duty Logger</TabsTrigger>
                        <TabsTrigger value="food" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Food Log</TabsTrigger>
                        <TabsTrigger value="inventory" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Inventory</TabsTrigger>
                        <TabsTrigger value="raw" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Raw Request</TabsTrigger>
                        <TabsTrigger value="reports" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Reports</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="duty" className="space-y-6">
                    <Card className="glass-card md:col-span-1 lg:col-span-1 h-[500px] flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Clock className="w-5 h-5 text-accent" /> On Duty Now
                                {activeStaff.length > 0 && (
                                    <span className="ml-auto relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-0 flex flex-col">
                            <DutyControl />
                            <ActiveStaffList initialStaff={activeStaff} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="food" className="space-y-6">
                    <FoodLogForm />
                </TabsContent>

                <TabsContent value="inventory" className="space-y-6">
                    <InventoryManager currentUser={currentUser} />
                </TabsContent>

                <TabsContent value="raw" className="space-y-6">
                    <RawRequestForm currentUser={currentUser} />
                </TabsContent>

                <TabsContent value="reports" className="space-y-6">
                    <ReportsGenerator userRole={userRole} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Polling Component for Active Staff
function ActiveStaffList({ initialStaff }: { initialStaff: any[] }) {
    const [staffList, setStaffList] = useState(initialStaff);
    const [isRefreshing, setIsRefreshing] = useState(false);
    // Force re-render for timer updates
    const [, setTick] = useState(0);

    const fetchStaff = async () => {
        setIsRefreshing(true);
        try {
            const mod = await import('@/actions/dashboard');
            const res = await mod.getLiveActiveStaff();
            if (res.success && res.activeStaff) {
                setStaffList(res.activeStaff);
            }
        } catch (err) {
            console.error("Failed to poll staff", err);
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (!document.hidden) {
                fetchStaff();
            }
        }, 60000);

        const timerInterval = setInterval(() => {
            setTick(t => t + 1);
        }, 60000);

        return () => {
            clearInterval(interval);
            clearInterval(timerInterval);
        };
    }, []);

    return (
        <div className="flex flex-col flex-1 min-h-0 relative">
            <div className="flex justify-end mb-2 px-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-50 hover:opacity-100"
                    onClick={fetchStaff}
                    disabled={isRefreshing}
                    title="Refresh List"
                >
                    <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <ScrollArea className="flex-1 pr-4">
                {staffList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground opacity-50">
                        <Users className="w-10 h-10 mb-2" />
                        <p>No active staff</p>
                    </div>
                ) : (
                    <div className="space-y-3 pb-2">
                        {staffList.map((staff: any) => (
                            <div key={staff.userId} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                    <div className="flex flex-col">
                                        <span className="font-medium truncate max-w-[100px] text-sm">{staff.displayName || staff.username}</span>
                                        <span className="text-xs text-muted-foreground font-mono opacity-80">{staff.rank}</span>
                                    </div>
                                </div>
                                <span suppressHydrationWarning className="text-[10px] text-muted-foreground font-mono bg-black/20 px-2 py-1 rounded">
                                    {formatDuration(staff.startTime)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}

function formatDuration(startTime: string | number) {
    const start = typeof startTime === 'string' ? new Date(startTime).getTime() : startTime;
    const diff = Date.now() - start;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
}
