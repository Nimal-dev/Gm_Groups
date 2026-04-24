'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { endRecurringOrder, updateRecurringOrder } from '@/actions/bulk-orders';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users, Clock, ShoppingCart, DollarSign, Activity, RefreshCw, X, Loader2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DutyControl } from '@/components/dashboard/DutyControl';
import { OrderRow } from '@/components/dashboard/OrderRowShared';

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
const InventoryManager = dynamic(() => import('@/components/dashboard/InventoryManager').then(mod => mod.InventoryManager), {
    loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading Inventory...</div>,
    ssr: false
});
const AdminEmployeeTable = dynamic(() => import('@/components/dashboard/AdminEmployeeTable').then(mod => mod.AdminEmployeeTable), {
    loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading Leaderboard...</div>,
    ssr: false
});
const FoodPrepCalculator = dynamic(() => import('@/components/dashboard/FoodPrepCalculator').then(mod => mod.FoodPrepCalculator), {
    loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading Calculator...</div>,
    ssr: false
});
const SalesLogForm = dynamic(() => import('@/components/dashboard/SalesLogForm').then(mod => mod.SalesLogForm), {
    loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading Sales Log...</div>,
    ssr: false
});

import { LeaveManagementCard } from '@/components/dashboard/LeaveManagementCard';

import { GamificationCard } from '@/components/dashboard/GamificationCard';

interface DashboardTabsProps {
    activeStaff: any[];
    activeOrders: any[];
    recurringOrders: any[]; // Added
    allEmployees: any[];
    recentSalaries: any[];
    activeLeaves: any[];
    userRole?: string;
    currentUser?: any; 
    dailySalaries?: any[];
}

export function DashboardTabs({ activeStaff, activeOrders, recurringOrders, allEmployees, recentSalaries, activeLeaves, dailySalaries = [], userRole = 'staff', currentUser }: DashboardTabsProps) {
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

    // Calculate User's Salary
    const [todaySalary, setTodaySalary] = useState<any>(dailySalaries.find((ds: any) => ds.userId === currentUser?.userId) || null);
    const [totalUnpaid, setTotalUnpaid] = useState<number>(currentUser?.unpaidSalary || 0);

    const [isRefreshingEarnings, setIsRefreshingEarnings] = useState(false);
    const [earningsCooldown, setEarningsCooldown] = useState(0);

    useEffect(() => {
        if (earningsCooldown > 0) {
            const timer = setTimeout(() => setEarningsCooldown(earningsCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [earningsCooldown]);

    const handleRefreshEarnings = async () => {
        if (earningsCooldown > 0) {
            toast({ 
                title: 'Please Wait', 
                description: `Refresh is on cooldown for ${earningsCooldown} more seconds.`, 
                variant: 'destructive',
                className: 'border-orange-500/50 bg-orange-500/10 text-orange-500' 
            });
            return;
        }
        if (isRefreshingEarnings) return;

        setIsRefreshingEarnings(true);
        try {
            const mod = await import('@/actions/dashboard');
            const res = await mod.getEmployeeEarnings(currentUser?.userId);
            if (res.success) {
                setTodaySalary(res.todaySalary);
                setTotalUnpaid(res.unpaidSalary || 0);
                setEarningsCooldown(30); 
            }
        } catch (err) {
            console.error("Failed to refresh earnings", err);
        } finally {
            setIsRefreshingEarnings(false);
        }
    };

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
                <TabsList className="glass-card bg-transparent border-0 p-1 w-max">
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
                            <TabsTrigger value="employees" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">All Employees (XP)</TabsTrigger>
                            <TabsTrigger value="logs" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Duty Logs</TabsTrigger>
                            <TabsTrigger value="bank" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Bank Logs</TabsTrigger>
                            <TabsTrigger value="payroll" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Payroll</TabsTrigger>
                            <TabsTrigger value="finances" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Salary History</TabsTrigger>
                        </>
                    )}

                    <TabsTrigger value="recurring" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent relative">
                        Recurring Orders
                        {activeContracts.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="foodlog" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Food Log</TabsTrigger>
                    <TabsTrigger value="saleslog" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Sales Log</TabsTrigger>
{/* <TabsTrigger value="inventory" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Inventory</TabsTrigger> */}
                    <TabsTrigger value="calculator" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent text-primary/80 font-bold">Calculator</TabsTrigger>
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
                                            <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/5">
                                                <span className="text-purple-400 font-bold uppercase tracking-wider text-[10px]">Delivery Day:</span>
                                                <span className="text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">{contract.deliveryDay || 'Unassigned'}</span>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-white/10 max-h-[150px] overflow-y-auto !scrollbar-thin !scrollbar-thumb-white/10">
                                            <p className="text-xs text-muted-foreground mb-2">Standard Items:</p>
                                            <div className="text-xs space-y-1">
                                                {formatContractItems(contract.items)}
                                            </div>
                                        </div>
                                    </div>

                                    {canManageBulk && (
                                        <div className="mt-4 pt-4 border-t border-white/10 flex gap-2 justify-end">
                                            <EditContractDialog contract={contract} onUpdate={() => { router.refresh(); }} />
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleEndContract(contract._id)}
                                                disabled={loadingMap[contract._id]}
                                                className="flex-1 text-xs h-8"
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
                                                <div className="text-xs text-muted-foreground font-mono max-w-[200px] truncate">{formatContractItems(contract.items)}</div>
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

            <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch mb-6">
                    {/* Gamification Card */}
                    <div className="lg:col-span-2 h-full">
                        {currentUser && <GamificationCard user={currentUser} />}
                    </div>

                    {/* Live Salary Card */}
                    <Card className="glass-card relative overflow-hidden border-orange-500/20 bg-gradient-to-br from-black/60 to-orange-950/20 h-full flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    Earnings Overview
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className={`h-6 w-6 transition-all ${earningsCooldown > 0 ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : 'opacity-50 hover:opacity-100'}`} 
                                        onClick={handleRefreshEarnings}
                                        title={earningsCooldown > 0 ? `Wait ${earningsCooldown}s to refresh` : "Refresh Earnings"}
                                    >
                                        <RefreshCw className={`w-3 h-3 ${isRefreshingEarnings ? 'animate-spin' : ''}`} />
                                    </Button>
                                </span>
                                <DollarSign className="w-4 h-4 text-orange-400" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <p className="text-3xl font-bold text-white mb-1">${totalUnpaid.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Available to claim (Includes Unpaid)</p>
                            </div>
                            
                            <div className="space-y-2 pt-3 border-t border-white/5">
                                <p className="text-xs font-semibold text-white/70 mb-2">TODAY'S GENERATION</p>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Base Salary</span>
                                    <span className="font-mono text-white">${(todaySalary?.baseSalaryEarned || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Sales Bonus</span>
                                    <span className="font-mono text-green-400">+${(todaySalary?.salesCommissionEarned || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Food Bonus</span>
                                    <span className="font-mono text-blue-400">+${(todaySalary?.foodCommissionEarned || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

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
                    {/* ... Rest of overview ... */}

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

            {/* EMPLOYEES LEADERBOARD TAB - Admin Only */}
            {
                isAdmin && (
                    <TabsContent value="employees" className="space-y-6 h-auto min-h-[500px] md:h-[800px]">
                        <AdminEmployeeTable />
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
                                                        <p className="text-sm font-semibold">{log.username || log.userId}</p>
                                                        <p className="text-xs text-muted-foreground">ID: {log.userId}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-2 md:mt-0 text-right">
                                                    {log.notes && <p className="text-xs italic text-accent mb-1">Note: {log.notes}</p>}
                                                    <p className="text-sm text-muted-foreground">Processed by {log.processorName || log.processedBy}</p>
                                                    <p className="text-xs opacity-50">{new Date(log.date).toLocaleDateString('en-GB')}</p>
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
                        <BulkOrderManager activeOrders={activeOrders} recurringOrders={recurringOrders} userRole={userRole} />
                    </TabsContent>)
            }

            {/* FOOD LOG TAB */}
            <TabsContent value="foodlog" className="space-y-6">
                <FoodLogForm />
            </TabsContent>

            {/* SALES LOG TAB */}
            <TabsContent value="saleslog" className="space-y-6">
                <SalesLogForm />
            </TabsContent>

            {/* INVENTORY TAB - DISABLED
            <TabsContent value="inventory" className="space-y-6">
                <InventoryManager currentUser={currentUser} />
            </TabsContent>
            */}

            {/* CALCULATOR TAB */}
            <TabsContent value="calculator" className="space-y-6">
                <FoodPrepCalculator />
            </TabsContent>

            {/* REPORTS TAB - For everyone now (restricted inside) */}
            <TabsContent value="reports" className="space-y-6">
                <ReportsGenerator userRole={userRole} />
            </TabsContent>
        </Tabs >
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

function formatContractItems(itemsStr: string) {
    if (!itemsStr) return null;
    
    // Ensure newlines before "1.", "2."
    let formatted = itemsStr.replace(/(\d+\.\s)/g, '\n$1');
    // Ensure newlines before common summary keywords
    formatted = formatted.replace(/(Subtotal:|Discount|Delivery Total:|Total:)/g, '\n$1');
    // Remove "RECURRING ITEMS:" if it's there tightly coupled
    formatted = formatted.replace(/RECURRING ITEMS:\s*/i, '');
    
    return formatted.split('\n').map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        
        // Highlight keywords
        if (trimmed.match(/^(Subtotal|Discount|Delivery Total|Total)/)) {
           return <div key={i} className="text-accent font-semibold mt-1">{trimmed}</div>;
        }
        
        return <div key={i} className="text-white/80">{trimmed}</div>;
    });
}

function EditContractDialog({ contract, onUpdate }: { contract: any, onUpdate: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Remove the trailing " Days" from intervalDays if it exists, or just use the number
    const initialFreq = contract.intervalDays ? contract.intervalDays.toString() : '7';

    const [formData, setFormData] = useState({
        customer: contract.customer || '',
        clientRep: contract.clientRep || '',
        amount: contract.amount ? contract.amount.toString() : '',
        securityDeposit: contract.securityDeposit ? contract.securityDeposit.toString() : '',
        startDate: contract.startDate || '',
        intervalDays: initialFreq,
        deliveryDay: contract.deliveryDay || 'Unassigned',
        items: contract.items || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.customer || !formData.amount || !formData.startDate || !formData.items) {
            toast({ title: 'Error', description: 'Please fill out all required fields.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                customer: formData.customer,
                clientRep: formData.clientRep,
                amount: formData.amount,
                securityDeposit: formData.securityDeposit ? parseFloat(formData.securityDeposit) : 0,
                startDate: formData.startDate,
                intervalDays: parseInt(formData.intervalDays, 10),
                deliveryDay: formData.deliveryDay === 'Unassigned' ? '' : formData.deliveryDay,
                items: formData.items
            };

            const res = await updateRecurringOrder(contract._id, payload);
            if (res.success) {
                toast({ title: 'Contract Updated', description: 'The recurring contract has been updated successfully.', className: 'bg-green-600 border-none' });
                setOpen(false);
                onUpdate();
            } else {
                throw new Error(res.error);
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8 bg-blue-500/10 border-blue-500/50 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300">
                    <Edit className="w-3 h-3 mr-2" /> Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] bg-black/60 backdrop-blur-2xl border-white/10 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl text-blue-400 flex items-center gap-2">
                        <Edit className="w-5 h-5" /> Edit Recurring Contract
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-400 text-xs uppercase tracking-wider">Customer Name *</Label>
                            <Input name="customer" value={formData.customer} onChange={handleChange} className="bg-black/50 border-white/10 text-white placeholder:text-white/30" placeholder="E.g., XMD" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-400 text-xs uppercase tracking-wider">Client Rep</Label>
                            <Input name="clientRep" value={formData.clientRep} onChange={handleChange} className="bg-black/50 border-white/10 text-white placeholder:text-white/30" placeholder="Rep Name" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-400 text-xs uppercase tracking-wider">Amount per Order *</Label>
                            <Input name="amount" value={formData.amount} onChange={handleChange} className="bg-black/50 border-white/10 text-white font-mono placeholder:text-white/30" placeholder="E.g., 5000" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-400 text-xs uppercase tracking-wider">Security Deposit</Label>
                            <Input name="securityDeposit" value={formData.securityDeposit} onChange={handleChange} className="bg-black/50 border-white/10 text-white font-mono placeholder:text-white/30" placeholder="E.g., 10000" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-400 text-xs uppercase tracking-wider">Start Date *</Label>
                            <Input name="startDate" value={formData.startDate} onChange={handleChange} className="bg-black/50 border-white/10 text-white placeholder:text-white/30" placeholder="DD/MM/YYYY" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-400 text-xs uppercase tracking-wider">Frequency *</Label>
                            <Select value={formData.intervalDays} onValueChange={(v) => handleSelectChange('intervalDays', v)}>
                                <SelectTrigger className="bg-black/50 border-white/10 text-white"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-black/80 backdrop-blur-xl border-white/10 text-white">
                                    <SelectItem value="1" className="hover:bg-white/10 focus:bg-white/10">Daily</SelectItem>
                                    <SelectItem value="3" className="hover:bg-white/10 focus:bg-white/10">Every 3 Days</SelectItem>
                                    <SelectItem value="7" className="hover:bg-white/10 focus:bg-white/10">Every 7 Days</SelectItem>
                                    <SelectItem value="14" className="hover:bg-white/10 focus:bg-white/10">Every 14 Days</SelectItem>
                                    <SelectItem value="30" className="hover:bg-white/10 focus:bg-white/10">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-400 text-xs uppercase tracking-wider">Delivery Day</Label>
                            <Select value={formData.deliveryDay} onValueChange={(v) => handleSelectChange('deliveryDay', v)}>
                                <SelectTrigger className="bg-black/50 border-white/10 text-purple-400"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-black/80 backdrop-blur-xl border-white/10 text-white">
                                    <SelectItem value="Unassigned" className="text-muted-foreground hover:bg-white/10 focus:bg-white/10">Unassigned</SelectItem>
                                    <SelectItem value="Monday" className="hover:bg-white/10 focus:bg-white/10">Monday</SelectItem>
                                    <SelectItem value="Tuesday" className="hover:bg-white/10 focus:bg-white/10">Tuesday</SelectItem>
                                    <SelectItem value="Wednesday" className="hover:bg-white/10 focus:bg-white/10">Wednesday</SelectItem>
                                    <SelectItem value="Thursday" className="hover:bg-white/10 focus:bg-white/10">Thursday</SelectItem>
                                    <SelectItem value="Friday" className="hover:bg-white/10 focus:bg-white/10">Friday</SelectItem>
                                    <SelectItem value="Saturday" className="hover:bg-white/10 focus:bg-white/10">Saturday</SelectItem>
                                    <SelectItem value="Sunday" className="hover:bg-white/10 focus:bg-white/10">Sunday</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-400 text-xs uppercase tracking-wider flex justify-between">
                            <span>Contract Items & Details *</span>
                            <span className="text-[10px] text-orange-400 opacity-70 border border-orange-500/30 px-1 rounded bg-orange-500/10">Use text formatting carefully</span>
                        </Label>
                        <Textarea 
                            name="items" 
                            value={formData.items} 
                            onChange={handleChange} 
                            className="bg-black/50 border-white/10 text-white font-mono text-sm min-h-[150px] whitespace-pre-wrap !scrollbar-thin" 
                        />
                    </div>
                </div>

                <DialogFooter className="border-t border-zinc-800 pt-4">
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
