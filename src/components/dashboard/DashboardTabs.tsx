'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { endRecurringOrder } from '@/actions/bulk-orders';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users, Clock, ShoppingCart, DollarSign, Activity, RefreshCw, X, Loader2 } from 'lucide-react';
import { DutyControl } from '@/components/dashboard/DutyControl';

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
const ReportsGenerator = dynamic(() => import('@/components/dashboard/ReportsGenerator').then(mod => mod.ReportsGenerator), {
    loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading Report Tool...</div>,
    ssr: false
});
const BulkOrderManager = dynamic(() => import('@/components/dashboard/BulkOrderManager').then(mod => mod.BulkOrderManager), {
    loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading Bulk Order System...</div>,
    ssr: false
});
const PayrollManagement = dynamic(() => import('@/components/dashboard/SalaryManagement').then(mod => mod.PayrollManagement), {
    loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading Payroll...</div>,
    ssr: false
});
const FoodLogForm = dynamic(() => import('@/components/dashboard/FoodLogForm').then(mod => mod.FoodLogForm), {
    loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading Food Log...</div>,
    ssr: false
});

import { LeaveManagementCard } from '@/components/dashboard/LeaveManagementCard';

interface DashboardTabsProps {
    activeStaff: any[];
    activeOrders: any[];
    recurringOrders: any[]; // Added
    allEmployees: any[];
    recentSalaries: any[];
    activeLeaves: any[];
    userRole?: string;
}

export function DashboardTabs({ activeStaff, activeOrders, recurringOrders, allEmployees, recentSalaries, activeLeaves, userRole = 'staff' }: DashboardTabsProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

    const isAdmin = userRole === 'admin';
    const isBulkhead = userRole === 'bulkhead';
    const canManageBulk = isAdmin || isBulkhead;

    const [hpPage, setHpPage] = useState(1);
    const HP_ITEMS_PER_PAGE = 2;

    const [pendingCateringCount, setPendingCateringCount] = useState(0);

    useEffect(() => {
        // Fetch pending catering requests count for notification badge
        import('@/actions/catering').then(async (mod) => {
            const res = await mod.getCateringRequests();
            if (res.success) {
                setPendingCateringCount(res.requests.length);
            }
        });
    }, []);

    const highPriorityOrders = activeOrders.filter((o: any) => ['Pending', 'In Progress', 'Processing'].includes(o.status));
    const totalHpPages = Math.ceil(highPriorityOrders.length / HP_ITEMS_PER_PAGE);
    const displayedHpOrders = highPriorityOrders.slice((hpPage - 1) * HP_ITEMS_PER_PAGE, hpPage * HP_ITEMS_PER_PAGE);

    const activeContracts = recurringOrders.filter((o: any) => o.status === 'Active');
    const endedContracts = recurringOrders.filter((o: any) => o.status === 'Ended');

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
        <Tabs defaultValue="overview" className="space-y-6">
            <div className="overflow-x-auto pb-2">
                <TabsList className="glass-card bg-transparent border-0 p-1">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Overview</TabsTrigger>
                    {canManageBulk && (
                        <TabsTrigger value="bulk" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent relative">
                            Bulk Orders
                            {pendingCateringCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                            )}
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="orders" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent relative">
                        Active Orders
                        {highPriorityOrders.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                            </span>
                        )}
                    </TabsTrigger>

                    {isAdmin && (
                        <>
                            <TabsTrigger value="staff" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Staff Management</TabsTrigger>
                            <TabsTrigger value="logs" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Duty Logs</TabsTrigger>
                            <TabsTrigger value="bank" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Bank Logs</TabsTrigger>
                            <TabsTrigger value="payroll" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Payroll</TabsTrigger>
                            <TabsTrigger value="finances" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Salary History</TabsTrigger>
                        </>
                    )}

                    <TabsTrigger value="recurring" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Recurring Orders</TabsTrigger>
                    <TabsTrigger value="foodlog" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Food Log</TabsTrigger>
                    <TabsTrigger value="reports" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Reports</TabsTrigger>
                </TabsList>
            </div>

            {/* OVERVIEW TAB */}
            {/* ... (Overview Content - Line 81) ... */}

            {/* RECURRING ORDERS TAB */}
            <TabsContent value="recurring" className="space-y-6">
                {/* Active Contracts */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-green-400" /> Active Recurring Contracts
                        </CardTitle>
                        <CardDescription>Automated recurring orders currently active.</CardDescription>
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
                                            <div className="flex justify-between">
                                                <span>Amount:</span>
                                                <span className="text-white">{contract.amount}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Frequency:</span>
                                                <span className="text-white">Every {contract.intervalDays} Days</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Start Date:</span>
                                                <span className="text-white">{contract.startDate}</span>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-white/10">
                                            <p className="text-xs text-muted-foreground mb-1">Standard Items:</p>
                                            <p className="text-xs line-clamp-2 italic opacity-70">{contract.items}</p>
                                        </div>
                                    </div>

                                    {canManageBulk && (
                                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleEndContract(contract._id)}
                                                disabled={loadingMap[contract._id]}
                                                className="w-full text-xs h-8"
                                            >
                                                {loadingMap[contract._id] ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <X className="w-3 h-3 mr-2" />} End Contract
                                            </Button>
                                        </div>
                                    )}

                                    <div className="mt-2 text-[10px] text-muted-foreground text-center">
                                        <span>Created by {contract.creatorName}</span>
                                    </div>
                                </div>
                            ))}
                            {activeContracts.length === 0 && (
                                <div className="col-span-full text-center py-10 text-muted-foreground">
                                    <RefreshCw className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p>No active recurring contracts.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Ended Contracts Log */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-lg text-muted-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Ended Contracts History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {endedContracts.length > 0 ? (
                            <div className="space-y-2">
                                {endedContracts.map((contract: any) => (
                                    <div key={contract._id} className="flex flex-col md:flex-row justify-between items-center p-3 rounded bg-white/5 opacity-70 hover:opacity-100 transition-opacity border border-white/5">
                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            <div className="p-2 rounded bg-red-500/10 text-red-500"><X className="w-4 h-4" /></div>
                                            <div>
                                                <h4 className="font-bold text-sm">{contract.customer}</h4>
                                                <p className="text-xs text-muted-foreground font-mono max-w-[200px] truncate">{contract.items}</p>
                                            </div>
                                        </div>
                                        <div className="text-left md:text-right mt-2 md:mt-0 w-full md:w-auto flex justify-between md:block">
                                            <Badge variant="secondary" className="mb-1 pointer-events-none opacity-50">Ended</Badge>
                                            <div className="text-[10px] text-muted-foreground">
                                                <p>Amount: {contract.amount}</p>
                                                <p>Ended: {contract.endedAt ? new Date(contract.endedAt).toLocaleDateString() : 'Just now'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center py-4 text-xs text-muted-foreground">No ended contracts history.</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Active Duty List */}
                    <Card className="glass-card md:col-span-1 lg:col-span-1 h-[400px] flex flex-col">
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

                    {/* Active Leaves */}
                    <div className="md:col-span-1 lg:col-span-1">
                        <LeaveManagementCard leaves={activeLeaves} employees={allEmployees} userRole={userRole} />
                    </div>

                    {/* Active Orders Quick View (Paginator) */}
                    <Card className="glass-card md:col-span-2 lg:col-span-2 h-[400px] flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <ShoppingCart className="w-5 h-5 text-accent" /> High Priority
                            </CardTitle>
                            {totalHpPages > 1 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setHpPage(p => Math.max(1, p - 1))}
                                        disabled={hpPage === 1}
                                        className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        &lt;
                                    </button>
                                    <span className="text-xs text-muted-foreground font-mono">{hpPage}/{totalHpPages}</span>
                                    <button
                                        onClick={() => setHpPage(p => Math.min(totalHpPages, p + 1))}
                                        disabled={hpPage === totalHpPages}
                                        className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        &gt;
                                    </button>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="flex-1 min-h-0">
                            <ScrollArea className="h-full pr-4">
                                {highPriorityOrders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                                        <ShoppingCart className="w-10 h-10 mb-2" />
                                        <p>No high priority orders</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {displayedHpOrders.map((order: any) => (
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
                        <CardDescription>Managing {activeOrders.filter((o: any) => !['Completed', 'Cancelled'].includes(o.status)).length} ongoing requests.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {activeOrders
                                .filter((o: any) => !['Completed', 'Cancelled'].includes(o.status))
                                .map((order: any) => (
                                    <OrderRow key={order.orderId} order={order} detailed />
                                ))}
                            {activeOrders.filter((o: any) => !['Completed', 'Cancelled'].includes(o.status)).length === 0 && (
                                <p className="text-center py-10 text-muted-foreground">No active orders found.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* PAYROLL TAB - Admin Only */}
            {
                isAdmin && (
                    <TabsContent value="payroll" className="space-y-6 h-auto min-h-[500px] md:h-[800px]">
                        <PayrollManagement employees={allEmployees} />
                    </TabsContent>
                )
            }

            {/* STAFF TAB - Admin Only */}
            {
                isAdmin && (
                    <TabsContent value="staff" className="space-y-6 h-auto min-h-[500px] md:h-[800px]">
                        <EmployeeManagement employees={allEmployees} />
                    </TabsContent>
                )
            }

            {/* LOGS TAB - Everyone */}
            <TabsContent value="logs" className="space-y-6 h-auto min-h-[500px] md:h-[800px]">
                <LogsExplorer employees={allEmployees} />
            </TabsContent>

            {
                isAdmin && (
                    <>
                        {/* BANK LOGS TAB */}
                        <TabsContent value="bank" className="space-y-6 h-auto min-h-[500px] md:h-[800px]">
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
                                                        <p className="font-mono font-medium">${log.amount.toLocaleString('en-US')}</p>
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
                    </>
                )
            }

            {/* BULK ORDER MANAGER TAB */}
            {
                canManageBulk && (
                    <TabsContent value="bulk" className="space-y-6">
                        <BulkOrderManager activeOrders={activeOrders} userRole={userRole} />
                    </TabsContent>)
            }

            {/* FOOD LOG TAB */}
            <TabsContent value="foodlog" className="space-y-6">
                <FoodLogForm />
            </TabsContent>

            {/* REPORTS TAB - For everyone now (restricted inside) */}
            <TabsContent value="reports" className="space-y-6">
                <ReportsGenerator userRole={userRole} />
            </TabsContent>
        </Tabs >
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

                    {/* Extended Details Grid */}
                    {detailed && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3 p-2 rounded bg-black/20 border border-white/5 text-xs">
                            <div>
                                <span className="text-muted-foreground block text-[10px]">Event Date</span>
                                <span className="font-mono">{order.eventDate || order.deliveryDate || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-[10px]">Collection</span>
                                <span className="font-mono">{order.collectionDate || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-[10px]">Surcharge</span>
                                <span className={order.surcharge && order.surcharge !== 'None' ? "text-orange-400 font-mono" : "font-mono"}>
                                    {order.surcharge || 'None'}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-[10px]">Representative</span>
                                <span className="truncate block font-medium" title={order.representative}>{order.representative || 'Unknown'}</span>
                            </div>
                        </div>
                    )}

                    {/* Order Items / Details */}
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
                    {/* Technical IDs hidden for cleaner UI
                    {detailed && (
                        <div className="mt-2 text-[10px] text-muted-foreground font-mono opacity-50 space-y-0.5">
                            <p title="Message ID">MSG: {order.messageId || 'N/A'}</p>
                            <p title="Channel ID">CH: {order.channelId || 'N/A'}</p>
                        </div>
                    )} */}
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

// Polling Component for Active Staff
function ActiveStaffList({ initialStaff }: { initialStaff: any[] }) {
    const [staffList, setStaffList] = useState(initialStaff);
    const [isRefreshing, setIsRefreshing] = useState(false);
    // Force re-render for timer updates
    const [, setTick] = useState(0);

    const fetchStaff = async () => {
        setIsRefreshing(true);
        try {
            // Dynamically import to avoid server-client boundary issues if any, though regular import works too
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
        // Poll for active staff every 60 seconds, but only if page is visible
        const interval = setInterval(() => {
            if (!document.hidden) {
                fetchStaff();
            }
        }, 60000);

        // Update durations display every minute without fetching data
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
            <div className="absolute top-[-3.5rem] right-0 mr-8"> {/* Positioning button in header area hackily or we can move it up via props if we refactor parent. But actually we can just put it inside the card content if we change structure. For now, let's put it top right of this container which is inside the card content */}
            </div>
            {/* We want the refresh button to be accessible. 
                 The parent renders the title. Let's add a small refresh icon absolute positioned or just inside the list area top right. 
                 Actually, the parent component renders the CardHeader. I cannot easily put the button IN the header from here without lifting state.
                 I will lift the refresh button to the list top right within the ScrollArea or just above it.
             */}
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
    // If it's a string (ISO date), convert to timestamp
    const start = typeof startTime === 'string' ? new Date(startTime).getTime() : startTime;
    const diff = Date.now() - start;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
}
