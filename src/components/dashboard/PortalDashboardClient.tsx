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
const InventoryManager = dynamic<{ currentUser: any }>(() => import('@/components/dashboard/InventoryManager').then(mod => mod.InventoryManager), {
    loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading Inventory...</div>,
    ssr: false
});
const ReportsGenerator = dynamic<{ userRole: string }>(() => import('@/components/dashboard/ReportsGenerator').then(mod => mod.ReportsGenerator), {
    loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading Report Tool...</div>,
    ssr: false
});
const RawRequestForm = dynamic<{ currentUser?: any }>(() => import('@/components/dashboard/RawRequestForm').then(mod => mod.RawRequestForm), {
    loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading Raw Requests...</div>,
    ssr: false
});
const BulkOrderManager = dynamic<{ activeOrders: any[], recurringOrders: any[], userRole: string }>(() => import('@/components/dashboard/BulkOrderManager').then(mod => mod.BulkOrderManager), { ssr: false });
const EmployeeManagement = dynamic<{ employees: any[] }>(() => import('@/components/dashboard/EmployeeManagement').then(mod => mod.EmployeeManagement), { ssr: false });
const BankLogsExplorer = dynamic(() => import('@/components/dashboard/BankLogsExplorer').then(mod => mod.BankLogsExplorer), { ssr: false });
const PayrollManagement = dynamic<{ employees: any[] }>(() => import('@/components/dashboard/SalaryManagement').then(mod => mod.PayrollManagement), { ssr: false });

import { Badge } from '@/components/ui/badge';
import { ShoppingCart, DollarSign, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { endRecurringOrder } from '@/actions/bulk-orders';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, RefreshCw, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface PortalDashboardClientProps {
    currentUser: any;
    userRole: string;
    activeStaff?: any[];
    activeOrders?: any[];
    recurringOrders?: any[];
    allEmployees?: any[];
    recentSalaries?: any[];
    activeLeaves?: any[];
}

export function PortalDashboardClient({ 
    currentUser, 
    userRole, 
    activeStaff = [], 
    activeOrders = [], 
    recurringOrders = [], 
    allEmployees = [], 
    recentSalaries = [] 
}: PortalDashboardClientProps) {
    const isAdmin = userRole === 'admin';
    const isBulkhead = userRole === 'bulkhead';
    const canManageBulk = isAdmin || isBulkhead;

    const router = useRouter();
    const { toast } = useToast();
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

    const activeContracts = recurringOrders.filter((o: any) => o.status === 'Active');

    const handleEndContract = async (contractId: string) => {
        if (!confirm('Are you sure you want to end this recurring contract? This action cannot be undone.')) return;
        setLoadingMap(prev => ({ ...prev, [contractId]: true }));
        const res = await endRecurringOrder(contractId);
        setLoadingMap(prev => ({ ...prev, [contractId]: false }));
        if (res.success) {
            toast({ title: 'Contract Ended', description: 'The recurring contract has been stopped.', className: 'bg-green-600 border-none' });
            router.refresh();
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' });
        }
    };

    return (
        <div className="w-full space-y-6">
            {/* Gamification / Level Display */}
            {currentUser && <GamificationCard user={currentUser} />}

            <Tabs defaultValue="duty" className="space-y-6">
                <div className="overflow-x-auto pb-2">
                    <TabsList className="glass-card bg-transparent border-0 p-1 w-max">
                        <TabsTrigger value="duty" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Duty Logger</TabsTrigger>
                        {canManageBulk && <TabsTrigger value="bulk" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Bulk Orders</TabsTrigger>}
                        <TabsTrigger value="orders" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Active Orders</TabsTrigger>
                        <TabsTrigger value="recurring" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Recurring</TabsTrigger>
                        {isAdmin && (
                            <>
                                <TabsTrigger value="staff" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Staff Management</TabsTrigger>
                                <TabsTrigger value="bank" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Bank Logs</TabsTrigger>
                                <TabsTrigger value="payroll" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Payroll</TabsTrigger>
                                <TabsTrigger value="finances" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Salary History</TabsTrigger>
                            </>
                        )}
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

                {/* Additional Extended Modules */}
                {/* Active Orders Quick View */}
                <TabsContent value="orders" className="space-y-6">
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>All Active Bulk Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {activeOrders.filter((o: any) => !['Completed', 'Cancelled'].includes(o.status)).map((order: any) => (
                                    <OrderRow key={order.orderId} order={order} detailed />
                                ))}
                                {activeOrders.filter((o: any) => !['Completed', 'Cancelled'].includes(o.status)).length === 0 && (
                                    <p className="text-center py-10 text-muted-foreground">No active orders found.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Recurring Orders */}
                <TabsContent value="recurring" className="space-y-6">
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <RefreshCw className="w-5 h-5 text-green-400" /> Active Recurring Contracts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activeContracts.map((contract: any) => (
                                    <div key={contract._id} className="p-4 rounded-lg bg-white/5 border border-l-4 border-l-green-500 border-white/5 flex flex-col justify-between group transition-colors hover:bg-white/10">
                                        <div>
                                            <div className="flex justify-between items-start mb-2 pr-2">
                                                <h3 className="font-bold text-lg">{contract.customer}</h3>
                                                <Badge variant="outline" className="text-green-400 border-green-500/50 bg-green-500/10">Active</Badge>
                                            </div>
                                            <div className="space-y-2 text-sm text-muted-foreground font-mono">
                                                <div className="flex justify-between"><span>Amount:</span> <span className="text-white">{contract.amount}</span></div>
                                                <div className="flex justify-between"><span>Frequency:</span> <span className="text-white">Every {contract.intervalDays} Days</span></div>
                                                <div className="flex justify-between"><span>Start Date:</span> <span className="text-white">{contract.startDate}</span></div>
                                            </div>
                                        </div>
                                        {canManageBulk && (
                                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
                                                <Button variant="destructive" size="sm" onClick={() => handleEndContract(contract._id)} disabled={loadingMap[contract._id]} className="w-full text-xs h-8">
                                                    End Contract
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {activeContracts.length === 0 && (
                                    <div className="col-span-full text-center py-10 text-muted-foreground">
                                        <p>No active recurring contracts.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Bulk Orders */}
                {canManageBulk && (
                    <TabsContent value="bulk" className="space-y-6">
                        <BulkOrderManager activeOrders={activeOrders} recurringOrders={recurringOrders} userRole={userRole} />
                    </TabsContent>
                )}

                {/* Admin Only Tabs */}
                {isAdmin && (
                    <>
                        <TabsContent value="staff" className="space-y-6">
                            <EmployeeManagement employees={allEmployees} />
                        </TabsContent>
                        <TabsContent value="bank" className="space-y-6">
                            <BankLogsExplorer />
                        </TabsContent>
                        <TabsContent value="payroll" className="space-y-6">
                            <PayrollManagement employees={allEmployees} />
                        </TabsContent>
                        <TabsContent value="finances" className="space-y-6">
                            <Card className="glass-card">
                                <CardHeader><CardTitle>Recent Salary Logs</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {recentSalaries.map((log: any) => (
                                            <div key={log._id} className="flex items-center justify-between p-4 rounded-lg bg-black/20 hover:bg-black/40">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 rounded-full bg-green-500/10 text-green-500"><DollarSign className="w-5 h-5"/></div>
                                                    <div>
                                                        <p className="font-mono font-medium">${log.amount.toLocaleString('en-US')}</p>
                                                        <p className="text-sm font-semibold">{log.username || log.userId}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-muted-foreground">Provider: {log.processorName || log.processedBy}</p>
                                                    <p className="text-xs opacity-50">{new Date(log.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {recentSalaries.length === 0 && <p className="text-center py-5 text-muted-foreground">No recent salary records.</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </>
                )}
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

// Helpers
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

                    {detailed && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3 p-2 rounded bg-black/20 border border-white/5 text-xs">
                            <div><span className="text-muted-foreground block text-[10px]">Event Date</span><span className="font-mono">{order.eventDate || order.deliveryDate || 'N/A'}</span></div>
                            <div><span className="text-muted-foreground block text-[10px]">Collection</span><span className="font-mono">{order.collectionDate || 'N/A'}</span></div>
                            <div className="col-span-2"><span className="text-muted-foreground block text-[10px]">Representative</span><span className="truncate block font-medium">{order.representative || 'Unknown'}</span></div>
                        </div>
                    )}

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
                </div>
            </div>
        </div>
    )
}

function getStatusStyles(status: string) {
    if (['Ready', 'Completed'].includes(status)) return { badge: 'border-green-500 text-green-400 bg-green-500/10' };
    if (['In Progress', 'Processing'].includes(status)) return { badge: 'border-blue-500 text-blue-400 bg-blue-500/10' };
    if (['Pending', 'Waiting'].includes(status)) return { badge: 'border-orange-500 text-orange-400 bg-orange-500/10' };
    return { badge: 'border-gray-500 text-gray-400 bg-gray-500/10' };
}
