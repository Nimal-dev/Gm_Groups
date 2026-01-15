'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Clock, ShoppingCart, DollarSign, Activity } from 'lucide-react';

// Lazy Load heavy tab components (Client-side only)
const EmployeeManagement = dynamic(() => import('@/components/dashboard/EmployeeManagement').then(mod => mod.EmployeeManagement), {
    loading: () => <div className="h-[500px] flex items-center justify-center text-muted-foreground animate-pulse">Loading Employees...</div>,
    ssr: false
});
const LogsExplorer = dynamic(() => import('@/components/dashboard/LogsExplorer').then(mod => mod.LogsExplorer), {
    loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading Logs...</div>,
    ssr: false
});
const BankLogsExplorer = dynamic(() => import('@/components/dashboard/BankLogsExplorer').then(mod => mod.BankLogsExplorer), {
    loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading Bank Records...</div>,
    ssr: false
});

import { LeaveManagementCard } from '@/components/dashboard/LeaveManagementCard';

interface DashboardTabsProps {
    activeStaff: any[];
    activeOrders: any[];
    allEmployees: any[];
    recentSalaries: any[];
    activeLeaves: any[];
}

export function DashboardTabs({ activeStaff, activeOrders, allEmployees, recentSalaries, activeLeaves }: DashboardTabsProps) {
    return (
        <Tabs defaultValue="overview" className="space-y-6">
            <div className="overflow-x-auto pb-2">
                <TabsList className="glass-card bg-transparent border-0 p-1">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Overview</TabsTrigger>
                    <TabsTrigger value="orders" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Active Orders</TabsTrigger>
                    <TabsTrigger value="staff" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Staff Management</TabsTrigger>
                    <TabsTrigger value="logs" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Duty Logs</TabsTrigger>
                    <TabsTrigger value="bank" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Bank Logs</TabsTrigger>
                    <TabsTrigger value="finances" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Salary History</TabsTrigger>
                </TabsList>
            </div>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Active Duty List */}
                    <Card className="glass-card md:col-span-1 lg:col-span-1 h-[400px] flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Clock className="w-5 h-5 text-accent" /> On Duty Now
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-0">
                            <ScrollArea className="h-full pr-4">
                                {activeStaff.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                                        <Users className="w-10 h-10 mb-2" />
                                        <p>No active staff</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {activeStaff.map((staff: any) => (
                                            <div key={staff.userId} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium truncate max-w-[100px]">{staff.displayName || staff.username}</span>
                                                        <span className="text-[10px] text-accent opacity-80">{staff.rank}</span>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    {formatDuration(staff.startTime)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Active Leaves */}
                    <div className="md:col-span-1 lg:col-span-1">
                        <LeaveManagementCard leaves={activeLeaves} employees={allEmployees} />
                    </div>

                    {/* Active Orders Quick View */}
                    <Card className="glass-card md:col-span-2 lg:col-span-2 h-[400px] flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <ShoppingCart className="w-5 h-5 text-accent" /> High Priority Orders
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-0">
                            <ScrollArea className="h-full pr-4">
                                {activeOrders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                                        <ShoppingCart className="w-10 h-10 mb-2" />
                                        <p>No active orders</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {activeOrders.slice(0, 5).map((order: any) => (
                                            <OrderRow key={order.orderId} order={order} detailed />
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            {/* ORDERS TAB */}
            <TabsContent value="orders" className="space-y-6">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>All Active Bulk Orders</CardTitle>
                        <CardDescription>Managing {activeOrders.length} ongoing requests.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {activeOrders.map((order: any) => (
                                <OrderRow key={order.orderId} order={order} detailed />
                            ))}
                            {activeOrders.length === 0 && <p className="text-center py-10 text-muted-foreground">No active orders found.</p>}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* STAFF TAB */}
            <TabsContent value="staff" className="space-y-6 h-[800px]">
                <EmployeeManagement employees={allEmployees} />
            </TabsContent>

            {/* LOGS TAB */}
            <TabsContent value="logs" className="space-y-6 h-[800px]">
                <LogsExplorer employees={allEmployees} />
            </TabsContent>

            {/* BANK LOGS TAB */}
            <TabsContent value="bank" className="space-y-6 h-[800px]">
                <BankLogsExplorer key="paginated-view" />
            </TabsContent>

            {/* FINANCES TAB */}
            <TabsContent value="finances" className="space-y-6">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Recent Salary Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {recentSalaries.map((log: any) => (
                                <div key={log._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-black/20 hover:bg-black/40 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-full bg-green-500/10 text-green-500">
                                            <DollarSign className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-mono font-medium">${log.amount.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">To ID: {log.userId}</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 md:mt-0 text-right">
                                        <p className="text-sm text-muted-foreground">Processed by {log.processedBy}</p>
                                        <p className="text-xs opacity-50">{new Date(log.date).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                            {recentSalaries.length === 0 && <p className="text-center py-10 text-muted-foreground">No recent salary records.</p>}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

        </Tabs>
    );
}

// Helper Components
function OrderRow({ order, detailed }: { order: any, detailed?: boolean }) {
    const statusStyles = getStatusStyles(order.status);

    return (
        <div className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 w-full text-start">
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className={`${statusStyles.badge} border transition-colors whitespace-nowrap`}>
                            {order.status}
                        </Badge>
                        <span className="font-bold text-lg text-green-400 font-mono">{order.amount}</span>
                        {detailed && order.isManual === false && <Badge variant="secondary" className="text-[10px] h-5">Automated</Badge>}
                    </div>

                    <div className="mb-2">
                        <h4 className="font-bold text-lg">{order.customer}</h4>
                        <p className="text-xs text-muted-foreground">Order #{order.orderId}</p>
                    </div>

                    {/* Always show details if they exist, but maybe collapsed? For now, showing fully as requested */}
                    {(detailed || order.details) && (
                        <div className="w-full bg-black/30 p-3 rounded-md border border-white/5 text-sm font-mono text-muted-foreground whitespace-pre-wrap">
                            {order.details}
                        </div>
                    )}
                </div>

                <div className="text-right flex flex-col items-end gap-1 min-w-[120px]">
                    <div className="flex items-center gap-1 text-accent">
                        <Clock className="w-3 h-3" />
                        <span className="text-sm font-medium">{order.deliveryDate}</span>
                    </div>
                    {detailed && (
                        <div className="mt-2 text-[10px] text-muted-foreground font-mono opacity-50 space-y-0.5">
                            <p title="Message ID">MSG: {order.messageId || 'N/A'}</p>
                            <p title="Channel ID">CH: {order.channelId || 'N/A'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function getStatusStyles(status: string) {
    if (['Ready', 'Completed'].includes(status)) {
        return { badge: 'border-green-500 text-green-400 bg-green-500/10' };
    }
    if (['In Progress', 'Processing'].includes(status)) {
        return { badge: 'border-blue-500 text-blue-400 bg-blue-500/10' };
    }
    if (['Pending', 'Waiting'].includes(status)) {
        return { badge: 'border-orange-500 text-orange-400 bg-orange-500/10' };
    }
    return { badge: 'border-gray-500 text-gray-400 bg-gray-500/10' };
}

function formatDuration(startTime: string | number) {
    // If it's a string (ISO date), convert to timestamp
    const start = typeof startTime === 'string' ? new Date(startTime).getTime() : startTime;
    const diff = Date.now() - start;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
}
