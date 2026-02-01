'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Package, User, DollarSign, RefreshCw, Send, X, Check, Truck, Loader2, Info, ShieldCheck, LayoutGrid, List } from 'lucide-react';
// Import Kanban Board Component
import { KanbanBoard } from '@/components/dashboard/KanbanBoard';
import { useToast } from '@/hooks/use-toast';
import { createCitizenOrder, createRecurringOrder, updateOrderStatus, endRecurringOrder } from '@/actions/bulk-orders';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { CateringRequestsManager } from '@/components/dashboard/CateringRequestsManager';
import { getCateringRequests } from '@/actions/catering';

export interface Order {
    orderId: string;
    messageId: string;
    channelId: string;
    status: string;
    customer: string;
    amount: string | number;
    eventDate?: string;
    deliveryDate?: string;
    collectionDate?: string;
    details?: string;
    createdAt?: string;
    // Add known fields to avoid any
    [key: string]: any;
}

export function BulkOrderManager({ activeOrders, recurringOrders = [], userRole }: { activeOrders: Order[], recurringOrders?: any[], userRole: string }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Manage State
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Citizen Form State
    const [citizenForm, setCitizenForm] = useState({ to: '', amount: '', eventDate: '', details: '' });

    // Recurring Form State
    const [recurringForm, setRecurringForm] = useState({ customer: '', clientRep: '', items: '', amount: '', startDate: '', intervalDays: '7', deliveryDetails: '', securityDeposit: '' });

    const [pendingCount, setPendingCount] = useState(0);
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

    useEffect(() => {
        getCateringRequests().then(res => {
            if (res.success) setPendingCount(res.requests.length);
        });
    }, []);

    // --- HANDLERS ---

    const handleCitizenSubmit = useCallback(async (e: React.FormEvent, overrideAmount?: string) => {
        setLoading(true);
        const res = await createCitizenOrder({
            ...citizenForm,
            amount: overrideAmount || citizenForm.amount
        });
        setLoading(false);
        if (res.success) {
            toast({ title: 'Success', description: `Order #${res.orderId} created successfully.` });
            setCitizenForm({ to: '', amount: '', eventDate: '', details: '' });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: res.error });
        }
    }, [citizenForm, toast]);

    const handleRecurringSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await createRecurringOrder({
            ...recurringForm,
            intervalDays: parseInt(recurringForm.intervalDays),
            securityDeposit: recurringForm.securityDeposit ? parseFloat(recurringForm.securityDeposit) : undefined
        });
        setLoading(false);
        if (res.success) {
            toast({ title: 'Success', description: 'Recurring Contract created.' });
            setRecurringForm({ customer: '', clientRep: '', items: '', amount: '', startDate: '', intervalDays: '7', deliveryDetails: '', securityDeposit: '' });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: res.error });
        }
    }, [recurringForm, toast]);


    const handleEndContract = useCallback(async (contractId: string) => {
        setLoading(true);
        const res = await endRecurringOrder(contractId);
        setLoading(false);
        if (res.success) {
            toast({ title: 'Contract Ended', description: 'The recurring contract has been terminated.' });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: res.error });
        }
    }, [toast]);

    const handleStatusUpdate = useCallback(async (order: Order, newStatus: string, reason?: string) => {
        setLoading(true);
        const res = await updateOrderStatus(order.orderId, order.messageId, order.channelId, newStatus, reason);
        setLoading(false);
        if (res.success) {
            toast({ title: 'Updated', description: `Order marked as ${newStatus}` });
            if (newStatus === 'Cancelled') setIsCancelDialogOpen(false);
        } else {
            toast({ variant: 'destructive', title: 'Failed', description: res.error });
        }
    }, [toast]);

    const openCancelDialog = useCallback((order: Order) => {
        setSelectedOrder(order);
        setCancelReason('');
        setIsCancelDialogOpen(true);
    }, []);

    const openDetails = useCallback((order: Order) => {
        setSelectedOrder(order);
        setIsDetailsOpen(true);
    }, []);

    const filteredActiveOrders = useMemo(() => activeOrders.filter(o => o.status !== 'Cancelled'), [activeOrders]);

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-accent" /> Bulk Order Management
                </CardTitle>
                <CardDescription>Create new orders or manage existing ones.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="requests" className="space-y-4">
                    <TabsList className="bg-black/20 w-full justify-start overflow-x-auto">
                        <TabsTrigger value="requests" className="relative">
                            Event Requests
                            {pendingCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="manage">Active Orders</TabsTrigger>
                        <TabsTrigger value="contracts">Active Contracts</TabsTrigger>
                        <TabsTrigger value="citizen">New Citizen Order</TabsTrigger>
                        <TabsTrigger value="event">New Event Request</TabsTrigger>
                        <TabsTrigger value="recurring">New Recurring Contract</TabsTrigger>
                    </TabsList>

                    {/* REQUESTS TAB */}
                    <TabsContent value="requests">
                        <CateringRequestsManager />
                    </TabsContent>

                    {/* MANAGE TAB */}
                    <TabsContent value="manage" className="space-y-4">
                        <div className="flex justify-end mb-2">
                            <div className="flex items-center bg-black/40 rounded-lg p-1 border border-white/5">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setViewMode('list')}
                                    className={`h-7 px-3 text-xs ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-muted-foreground'}`}
                                >
                                    <List className="w-3 h-3 mr-2" /> List
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setViewMode('kanban')}
                                    className={`h-7 px-3 text-xs ${viewMode === 'kanban' ? 'bg-white/10 text-white' : 'text-muted-foreground'}`}
                                >
                                    <LayoutGrid className="w-3 h-3 mr-2" /> Board
                                </Button>
                            </div>
                        </div>

                        {viewMode === 'kanban' ? (
                            <KanbanBoard
                                orders={filteredActiveOrders}
                                onStatusUpdate={handleStatusUpdate}
                                onViewDetails={openDetails}
                            />
                        ) : (
                            <Tabs defaultValue="pending" className="w-full">
                                <TabsList className="bg-black/40 w-full justify-start border-b border-white/5 rounded-none p-0 h-10">
                                    <TabsTrigger value="pending" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent">Pending</TabsTrigger>
                                    <TabsTrigger value="progress" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent">On Progress</TabsTrigger>
                                    <TabsTrigger value="completed" className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent">Completed</TabsTrigger>
                                    <TabsTrigger value="cancelled" className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:bg-transparent">Cancelled</TabsTrigger>
                                </TabsList>

                                {['pending', 'progress', 'completed', 'cancelled'].map(statusTab => (
                                    <TabsContent key={statusTab} value={statusTab} className="pt-4">
                                        <ScrollArea className="h-[600px] pr-4">
                                            <div className="space-y-3">
                                                {activeOrders.filter(o =>
                                                    statusTab === 'pending' ? o.status === 'Pending' :
                                                        statusTab === 'progress' ? (o.status === 'In Progress' || o.status === 'Ready') :
                                                            statusTab === 'completed' ? o.status === 'Completed' :
                                                                statusTab === 'cancelled' ? o.status === 'Cancelled' : false
                                                ).map((order) => (
                                                    <div key={order.orderId} className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                                                        <div className="flex flex-col md:flex-row justify-between gap-4">
                                                            <div className="flex-1 space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant="outline" className={`${getStatusColor(order.status)}`}>{order.status}</Badge>
                                                                    <span className="font-mono text-sm text-muted-foreground">#{order.orderId}</span>
                                                                    <span className="font-bold">{order.customer}</span>
                                                                </div>
                                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                                    <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> Event: {order.eventDate ? new Date(order.eventDate).toLocaleDateString() : (order.deliveryDate || 'N/A')}</span>
                                                                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {order.amount}</span>
                                                                    {order.collectionDate && <span className="flex items-center gap-1 text-orange-400">Collect: {order.collectionDate}</span>}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <Button size="sm" variant="ghost" onClick={() => openDetails(order)}>
                                                                    <Info className="w-4 h-4 mr-1" /> Details
                                                                </Button>

                                                                {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                                                                    <>
                                                                        {order.status === 'Pending' && (
                                                                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusUpdate(order, 'In Progress')} disabled={loading}>
                                                                                Start
                                                                            </Button>
                                                                        )}
                                                                        {order.status === 'In Progress' && (
                                                                            <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => handleStatusUpdate(order, 'Ready')} disabled={loading}>
                                                                                Ready
                                                                            </Button>
                                                                        )}
                                                                        {order.status === 'Ready' && (
                                                                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(order, 'Completed')} disabled={loading}>
                                                                                Complete
                                                                            </Button>
                                                                        )}
                                                                        <Button size="sm" variant="destructive" onClick={() => openCancelDialog(order)} disabled={loading}>
                                                                            <X className="w-4 h-4" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {activeOrders.filter(o =>
                                                    statusTab === 'pending' ? o.status === 'Pending' :
                                                        statusTab === 'progress' ? (o.status === 'In Progress' || o.status === 'Ready') :
                                                            statusTab === 'completed' ? o.status === 'Completed' :
                                                                statusTab === 'cancelled' ? o.status === 'Cancelled' : false
                                                ).length === 0 && <p className="text-center py-10 text-muted-foreground">No orders in this category.</p>}
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        )}
                    </TabsContent>

                    {/* ACTIVE CONTRACTS TAB */}
                    <TabsContent value="contracts" className="space-y-4">
                        <ScrollArea className="h-[600px] pr-4">
                            <div className="space-y-3">
                                {recurringOrders && recurringOrders.length > 0 ? recurringOrders.map((contract: any) => (
                                    <div key={contract._id} className="p-4 rounded-lg bg-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-all">
                                        <div className="flex flex-col md:flex-row justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-green-500 text-black hover:bg-green-600">Active Contract</Badge>
                                                    <span className="font-bold text-lg">{contract.customer}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-2"><User className="w-3 h-3 text-accent" /> Rep: {contract.clientRep || 'N/A'}</span>
                                                    <span className="flex items-center gap-2"><DollarSign className="w-3 h-3 text-green-400" /> {contract.amount} / delivery</span>
                                                    <span className="flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-orange-400" /> Deposit: {contract.securityDeposit ? `$${contract.securityDeposit}` : 'N/A'}</span>
                                                    <span className="flex items-center gap-2"><RefreshCw className="w-3 h-3 text-blue-400" /> Every {contract.intervalDays} Days</span>
                                                    <span className="flex items-center gap-2"><CalendarIcon className="w-3 h-3" /> Started: {contract.startDate}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="outline" className="border-red-500/50 hover:bg-red-500/10 text-red-400">
                                                            End Contract
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="glass-card">
                                                        <DialogHeader>
                                                            <DialogTitle>End Contract?</DialogTitle>
                                                            <DialogDescription>
                                                                This will stop future automated orders for <strong>{contract.customer}</strong>.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="flex justify-end gap-2 mt-4">
                                                            <Button variant="ghost">Cancel</Button>
                                                            {/* Implement End Contract Handler if needed, or simple display for now */}
                                                            <Button variant="destructive" onClick={() => handleEndContract(contract._id)} disabled={loading}>
                                                                {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null} Confirm End
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-xs font-mono bg-black/30 p-2 rounded text-muted-foreground">
                                            {contract.items}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 text-muted-foreground">No active recurring contracts.</div>
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    {/* CITIZEN ORDER TAB */}
                    <TabsContent value="citizen">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const calc = calculateTotal(citizenForm.amount, citizenForm.eventDate);
                                    handleCitizenSubmit(e, calc.total.toString());
                                }} className="space-y-4 p-4 bg-black/20 rounded-lg border border-white/5">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-accent" /> Create Citizen Bulk Order
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Customer / Organization Name</Label>
                                            <Input required placeholder="Ex. John Doe / Taxi Cab Co." value={citizenForm.to} onChange={e => setCitizenForm({ ...citizenForm, to: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Base Amount ($)</Label>
                                            <Input required type="number" placeholder="5000" value={citizenForm.amount} onChange={e => setCitizenForm({ ...citizenForm, amount: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Event Date (YYYY-MM-DD)</Label>
                                        <div className="relative">
                                            <Input required type="date" value={citizenForm.eventDate} onChange={e => setCitizenForm({ ...citizenForm, eventDate: e.target.value })} />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">Surcharge is automatically calculated based on this date.</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded border border-white/10 text-sm space-y-1">
                                        {(() => {
                                            const calc = calculateTotal(citizenForm.amount, citizenForm.eventDate);
                                            return (
                                                <>
                                                    <div className="flex justify-between text-muted-foreground">
                                                        <span>Base Amount:</span>
                                                        <span>${calc.base}</span>
                                                    </div>
                                                    <div className="flex justify-between text-orange-400">
                                                        <span>Surcharge ({calc.msg}):</span>
                                                        <span>+${calc.surcharge}</span>
                                                    </div>
                                                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
                                                        <span>Total to Pay:</span>
                                                        <span className="text-green-400">${calc.total}</span>
                                                    </div>
                                                </>
                                            )
                                        })()}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Order Details</Label>
                                        <Textarea required placeholder="List of items..." className="h-40 font-mono" value={citizenForm.details} onChange={e => setCitizenForm({ ...citizenForm, details: e.target.value })} />
                                    </div>
                                    <Button type="submit" disabled={loading} className="w-full">
                                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />} Create Order
                                    </Button>
                                </form>
                            </div>
                            <div className="lg:col-span-1 space-y-6">
                                <div className="p-6 rounded-lg bg-accent/5 border border-accent/20 space-y-4">
                                    <h4 className="font-bold text-accent flex items-center gap-2">
                                        <Info className="w-4 h-4" /> Bulk Order Policy
                                    </h4>
                                    <div className="space-y-3 text-sm text-muted-foreground">
                                        <p>
                                            Ensure all details are accurate before submitting. The system automatically calculates fees based on the <strong>Notice Period</strong> (Days between Today and Collection).
                                        </p>
                                        <ul className="list-disc pl-4 space-y-1">
                                            <li><strong className="text-white">Standard:</strong> 5+ Days Notice</li>
                                            <li><strong className="text-yellow-400">Late:</strong> 3-4 Days Notice (+15%)</li>
                                            <li><strong className="text-orange-400">Superfast:</strong> 1-2 Days Notice (+30%)</li>
                                            <li><strong className="text-red-400">SuperFine:</strong> &lt; 1 Day Notice (3x Total)</li>
                                        </ul>
                                        <div className="pt-2 border-t border-white/10">
                                            <p className="text-xs">
                                                Collection Date is automatically set to <strong>1 Day Prior</strong> to the Event Date.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 rounded-lg bg-white/5 border border-white/5">
                                    <h4 className="font-bold text-sm mb-2">Instructions</h4>
                                    <ol className="list-decimal pl-4 space-y-4 text-xs text-muted-foreground">
                                        <li>Enter the full Client Name or Org.</li>
                                        <li>Input the agreed Total Amount.</li>
                                        <li>Select the correct Event Date.</li>
                                        <li>List all items clearly in standard format (e.g. 100x Burgers).</li>
                                        <li>Submit to generate the Discord Order.</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* EVENT REQUEST TAB */}
                    <TabsContent value="event">
                        <div className="p-10 text-center text-muted-foreground">
                            <p>Use the standard <strong>Catering Request</strong> form on the main website.</p>
                            <Button variant="link" asChild className="text-accent mt-2">
                                <a href="/catering-request" target="_blank">Go to Catering Form</a>
                            </Button>
                        </div>
                    </TabsContent>

                    {/* RECURRING TAB */}
                    <TabsContent value="recurring">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left: Form */}
                            <div className="lg:col-span-2">
                                <form onSubmit={handleRecurringSubmit} className="space-y-4 p-4 bg-black/20 rounded-lg border border-white/5">
                                    <h3 className="text-lg font-bold mb-4 text-green-400 flex items-center gap-2">
                                        <RefreshCw className="w-5 h-5" /> Create Recurring Contract
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Customer Name</Label>
                                            <Input required placeholder="Ex. Police Dept" value={recurringForm.customer} onChange={e => setRecurringForm({ ...recurringForm, customer: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Client Representative</Label>
                                            <Input placeholder="Ex. Chief Davis" value={recurringForm.clientRep} onChange={e => setRecurringForm({ ...recurringForm, clientRep: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Amount Per Delivery</Label>
                                            <Input required placeholder="5000" value={recurringForm.amount} onChange={e => {
                                                const amt = parseFloat(e.target.value || '0');
                                                setRecurringForm({ ...recurringForm, amount: e.target.value, securityDeposit: (amt * 2).toString() });
                                            }} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Security Deposit (Auto-calc)</Label>
                                            <Input placeholder="10000" value={recurringForm.securityDeposit} onChange={e => setRecurringForm({ ...recurringForm, securityDeposit: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 flex flex-col">
                                            <Label>Start Date</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant={"outline"} className={`w-full justify-start text-left font-normal ${!recurringForm.startDate && "text-muted-foreground"}`}>
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {recurringForm.startDate ? recurringForm.startDate : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={recurringForm.startDate ? new Date(recurringForm.startDate.split('/').reverse().join('-')) : undefined}
                                                        onSelect={(date) => {
                                                            if (date) {
                                                                const formatted = format(date, 'dd/MM/yyyy');
                                                                setRecurringForm({ ...recurringForm, startDate: formatted });
                                                            }
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Frequency (Days)</Label>
                                            <Select value={recurringForm.intervalDays} onValueChange={v => setRecurringForm({ ...recurringForm, intervalDays: v })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">Daily</SelectItem>
                                                    <SelectItem value="3">Every 3 Days</SelectItem>
                                                    <SelectItem value="7">Weekly</SelectItem>
                                                    <SelectItem value="14">Bi-Weekly</SelectItem>
                                                    <SelectItem value="30">Monthly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Items List</Label>
                                        <Textarea required placeholder="100x Burgers, 50x Sodas..." value={recurringForm.items} onChange={e => setRecurringForm({ ...recurringForm, items: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Delivery Instructions</Label>
                                        <Input placeholder="Leave at reception..." value={recurringForm.deliveryDetails} onChange={e => setRecurringForm({ ...recurringForm, deliveryDetails: e.target.value })} />
                                    </div>
                                    <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                                        {loading ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />} Create Contract
                                    </Button>
                                </form>
                            </div>

                            {/* Right: Instructions */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="p-6 rounded-lg bg-accent/5 border border-accent/20 space-y-4">
                                    <h4 className="font-bold text-accent flex items-center gap-2">
                                        <Info className="w-4 h-4" /> Contract Guidelines
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Recurring contracts automatically generate orders on the specified schedule.
                                    </p>
                                    <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                                        <li><strong className="text-white">Start Date:</strong> Must be in DD/MM/YYYY format.</li>
                                        <li><strong className="text-white">Amount:</strong> Fixed price per delivery.</li>
                                        <li><strong className="text-white">Cron Job:</strong> Checks daily at midnight.</li>
                                    </ul>
                                </div>
                                <div className="p-6 rounded-lg bg-white/5 border border-white/5">
                                    <h4 className="font-bold text-sm mb-2">Setup Steps</h4>
                                    <ol className="list-decimal pl-4 space-y-3 text-xs text-muted-foreground">
                                        <li>Define the client and agreed per-delivery cost.</li>
                                        <li>Choose a start date (can be future).</li>
                                        <li>Set the frequency (e.g., Weekly).</li>
                                        <li>Input the standard items for each delivery.</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>

            {/* CANCEL DIALOG */}
            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogContent className="glass-card">
                    <DialogHeader>
                        <DialogTitle>Cancel Order</DialogTitle>
                        <DialogDescription>Are you sure? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label>Reason for Cancellation</Label>
                        <Input value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Ex. Customer request, Out of stock..." />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsCancelDialogOpen(false)}>Back</Button>
                        <Button variant="destructive" onClick={() => selectedOrder && handleStatusUpdate(selectedOrder, 'Cancelled', cancelReason)} disabled={!cancelReason || loading}>
                            {loading ? <Loader2 className="animate-spin" /> : 'Confirm Cancel'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DETAILS DIALOG */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="glass-card max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Order Details #{selectedOrder?.orderId}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-muted-foreground">Customer:</span> <br /><span className="font-bold">{selectedOrder?.customer}</span></div>
                            <div><span className="text-muted-foreground">Amount:</span> <br /><span className="font-mono">{selectedOrder?.amount}</span></div>
                            <div><span className="text-muted-foreground">Status:</span> <br /><Badge>{selectedOrder?.status}</Badge></div>
                            <div><span className="text-muted-foreground">Created:</span> <br />{selectedOrder?.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}</div>
                            <div><span className="text-muted-foreground">Event Date:</span> <br />{selectedOrder?.eventDate || selectedOrder?.deliveryDate}</div>
                            <div><span className="text-muted-foreground">Collection:</span> <br />{selectedOrder?.collectionDate || 'N/A'}</div>
                        </div>
                        <div className="bg-black/30 p-4 rounded text-sm font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                            {selectedOrder?.details}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'Pending': return 'border-orange-500 text-orange-400 bg-orange-500/10';
        case 'In Progress': return 'border-blue-500 text-blue-400 bg-blue-500/10';
        case 'Ready': return 'border-indigo-500 text-indigo-400 bg-indigo-500/10';
        case 'Completed': return 'border-green-500 text-green-400 bg-green-500/10';
        case 'Cancelled': return 'border-red-500 text-red-400 bg-red-500/10';
        default: return 'border-gray-500 text-gray-400 bg-gray-500/10';
    }
}

function calculateTotal(baseAmount: string, eventDate: string) {
    if (!baseAmount || !eventDate) return { base: 0, surcharge: 0, total: 0, msg: "Pending Info" };

    const base = parseFloat(baseAmount);
    if (isNaN(base)) return { base: 0, surcharge: 0, total: 0, msg: "Invalid Amount" };

    // Same Logic as Bot
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const event = new Date(eventDate);
    // Collection date is 1 day before event
    const collection = new Date(event);
    collection.setDate(event.getDate() - 1);

    const diffTime = collection.getTime() - today.getTime();
    const daysNotice = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let surcharge = 0;
    let msg = "Standard";

    if (daysNotice < 1) { // 3x
        surcharge = base * 2; // +200% = 3x total
        msg = "SuperFine (3x)";
    } else if (daysNotice <= 2) {
        surcharge = base * 0.30;
        msg = "SuperFast (+30%)";
    } else if (daysNotice <= 4) {
        surcharge = base * 0.15;
        msg = "Late (+15%)";
    }

    return {
        base: base,
        surcharge: Math.round(surcharge),
        total: Math.round(base + surcharge),
        msg
    };
}
