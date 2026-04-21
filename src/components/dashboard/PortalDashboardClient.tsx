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
const BulkOrderManager = dynamic(() => import('@/components/dashboard/BulkOrderManager').then(mod => mod.BulkOrderManager), {
    loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading Bulk Order System...</div>,
    ssr: false
});
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
const PayrollManagement = dynamic(() => import('@/components/dashboard/SalaryManagement').then(mod => mod.PayrollManagement), {
    loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading Payroll...</div>,
    ssr: false
});
const AdminEmployeeTable = dynamic(() => import('@/components/dashboard/AdminEmployeeTable').then(mod => mod.AdminEmployeeTable), {
    loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading Leaderboard...</div>,
    ssr: false
});

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, RefreshCw, Users, ShoppingCart, Package, DollarSign, Activity, ListChecks } from 'lucide-react';
import { OrderRow } from '@/components/dashboard/OrderRowShared';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface PortalDashboardClientProps {
    currentUser: any;
    userRole: string;
    activeStaff?: any[];
    activeOrders?: any[];
    recurringOrders?: any[];
    allEmployees?: any[];
    recentSalaries?: any[];
    activeLeaves?: any[];
    dailySalaries?: any[];
    bankStats?: any;
}

export function PortalDashboardClient({
    currentUser,
    userRole,
    activeStaff = [],
    activeOrders = [],
    recurringOrders = [],
    allEmployees = [],
    recentSalaries = [],
    activeLeaves = [],
    dailySalaries = [],
    bankStats = { totalIncome: 0, totalExpense: 0, currentBalance: 0 }
}: PortalDashboardClientProps) {
    const isAdmin = userRole === 'admin';
    const isBulkhead = userRole === 'bulkhead';
    const canManageBulk = isAdmin || isBulkhead;

    const highPriorityOrders = activeOrders.filter((o: any) => ['Pending', 'In Progress', 'Processing'].includes(o.status));
    const activeContracts = recurringOrders.filter((o: any) => o.status === 'Active');
    const endedContracts = recurringOrders.filter((o: any) => o.status === 'Ended');
    const { toast } = useToast();

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
                setEarningsCooldown(30); // 30 seconds cooldown
            }
        } catch (err) {
            console.error("Failed to refresh earnings", err);
        } finally {
            setIsRefreshingEarnings(false);
        }
    };

    return (
        <div className="w-full space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch mb-6">
                {/* Gamification / Level Display */}
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

            <Tabs defaultValue="duty" className="space-y-6">
                <div className="overflow-x-auto pb-2">
                    <TabsList className="glass-card bg-transparent border-0 p-1 w-max">
                        <TabsTrigger value="duty" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Duty Logger</TabsTrigger>
                        {canManageBulk && (
                            <TabsTrigger value="bulk" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Bulk Orders</TabsTrigger>
                        )}
                        <TabsTrigger value="orders" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent relative">
                            Active Orders
                            {highPriorityOrders.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="recurring" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Recurring Orders</TabsTrigger>
                        <TabsTrigger value="food" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Food Log</TabsTrigger>
                        {/* <TabsTrigger value="inventory" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Inventory</TabsTrigger> */}
                        <TabsTrigger value="raw" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Raw Request</TabsTrigger>
                        <TabsTrigger value="logs" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Duty Logs</TabsTrigger>
                        {isAdmin && (
                            <>
                                <TabsTrigger value="staff" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Staff Management</TabsTrigger>
                                <TabsTrigger value="employees" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">All Employees (XP)</TabsTrigger>
                                <TabsTrigger value="payroll" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Payroll</TabsTrigger>
                                <TabsTrigger value="bank" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Bank Logs</TabsTrigger>
                                <TabsTrigger value="finances" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Salary History</TabsTrigger>
                            </>
                        )}
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

                {canManageBulk && (
                    <TabsContent value="bulk" className="space-y-6">
                        <BulkOrderManager activeOrders={activeOrders} recurringOrders={recurringOrders} userRole={userRole} />
                    </TabsContent>
                )}

                <TabsContent value="orders" className="space-y-6">
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-accent" /> Active Bulk Orders
                            </CardTitle>
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

                                            <div className="mt-3 pt-3 border-t border-white/10 max-h-[150px] overflow-y-auto !scrollbar-thin !scrollbar-thumb-white/10">
                                                <p className="text-xs text-muted-foreground mb-2">Standard Items:</p>
                                                <div className="text-xs space-y-1">
                                                    {formatContractItems(contract.items)}
                                                </div>
                                            </div>
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
                                                <div className="p-2 rounded bg-red-500/10 text-red-500"><Package className="w-4 h-4" /></div>
                                                <div>
                                                    <h4 className="font-bold text-sm">{contract.customer}</h4>
                                                    <div className="text-xs text-muted-foreground font-mono max-w-[200px] truncate">{formatContractItems(contract.items)}</div>
                                                </div>
                                            </div>
                                            <div className="text-left md:text-right mt-2 md:mt-0 w-full md:w-auto flex justify-between md:block">
                                                <Badge variant="secondary" className="mb-1 pointer-events-none opacity-50">Ended</Badge>
                                                <div className="text-[10px] text-muted-foreground">
                                                    <p>Amount: {contract.amount}</p>
                                                    <p>Ended: {contract.endedAt ? new Date(contract.endedAt).toLocaleDateString() : 'N/A'}</p>
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

                <TabsContent value="food" className="space-y-6">
                    <FoodLogForm />
                </TabsContent>

                {/* <TabsContent value="inventory" className="space-y-6">
                    <InventoryManager currentUser={currentUser} />
                </TabsContent> */}

                <TabsContent value="raw" className="space-y-6">
                    <RawRequestForm currentUser={currentUser} />
                </TabsContent>

                <TabsContent value="reports" className="space-y-6">
                    <ReportsGenerator userRole={userRole} />
                </TabsContent>

                <TabsContent value="logs" className="space-y-6 h-auto min-h-[500px] lg:h-[800px]">
                    <LogsExplorer employees={allEmployees} />
                </TabsContent>

                {isAdmin && (
                    <>
                        <TabsContent value="staff" className="space-y-6 h-auto min-h-[500px] lg:h-[800px]">
                            <EmployeeManagement employees={allEmployees} />
                        </TabsContent>

                        <TabsContent value="employees" className="space-y-6 h-auto min-h-[500px] lg:h-[800px]">
                            <AdminEmployeeTable />
                        </TabsContent>

                        <TabsContent value="payroll" className="space-y-6 h-auto min-h-[500px] lg:h-[800px]">
                            <PayrollManagement employees={allEmployees} />
                        </TabsContent>

                        <TabsContent value="bank" className="space-y-6 h-auto min-h-[500px] lg:h-[800px]">
                            <BankLogsExplorer key="portal-bank-view" />
                        </TabsContent>

                        <TabsContent value="finances" className="space-y-6">
                            <Card className="glass-card">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <DollarSign className="w-5 h-5 text-green-400" /> Recent Salary Logs
                                            </CardTitle>
                                            <CardDescription>Latest processed salary payments.</CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Balance</p>
                                            <p className="text-xl font-bold font-mono text-green-400">${bankStats.currentBalance?.toLocaleString() || '0'}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentSalaries.map((log: any) => (
                                            <div key={log._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 rounded-full bg-green-500/10 text-green-500">
                                                        <DollarSign className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-mono font-medium text-lg">${log.amount.toLocaleString('en-US')}</p>
                                                        <p className="font-semibold">{log.username || log.userId}</p>
                                                        <p className="text-xs text-muted-foreground opacity-70">ID: {log.userId}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-3 md:mt-0 text-left md:text-right">
                                                    {log.notes && <p className="text-xs italic text-accent mb-1 px-2 py-0.5 bg-accent/10 rounded-full inline-block">Note: {log.notes}</p>}
                                                    <p className="text-sm text-muted-foreground">Processed by {log.processorName || log.processedBy}</p>
                                                    <p className="text-xs opacity-50 font-mono">{new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {recentSalaries.length === 0 && (
                                            <div className="text-center py-20 bg-white/5 rounded-lg border border-dashed border-white/10">
                                                <Activity className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                                <p className="text-muted-foreground">No recent salary records found.</p>
                                            </div>
                                        )}
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

