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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Package, User, DollarSign, RefreshCw, Send, X, Check, Truck, Loader2, Info, ShieldCheck, LayoutGrid, List, Plus, Trash2 } from 'lucide-react';
// Import Kanban Board Component
import { KanbanBoard } from '@/components/dashboard/KanbanBoard';
import { useToast } from '@/hooks/use-toast';
import { createCitizenOrder, createRecurringOrder, updateOrderStatus, endRecurringOrder } from '@/actions/bulk-orders';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { CateringRequestsManager } from '@/components/dashboard/CateringRequestsManager';
import { getCateringRequests } from '@/actions/catering';
import { calculateBulkOrderSurcharge } from '@/lib/pricing-utils';

export interface OrderItem {
    description: string;
    quantity: number;
    price: number;
}

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

    // Optimistic UI State
    const [localOrders, setLocalOrders] = useState<Order[]>(activeOrders);

    useEffect(() => {
        setLocalOrders(activeOrders);
    }, [activeOrders]);

    // Manage State
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Citizen Form State
    const [citizenForm, setCitizenForm] = useState({
        to: '',
        deliveryDate: '',
        items: [] as OrderItem[],
        discount: '0',
        isAutoFine: true,
        customTotal: ''
    });

    // Recurring Form State
    const [recurringForm, setRecurringForm] = useState({
        customer: '',
        clientRep: '',
        items: [] as OrderItem[],
        discount: '0',
        amount: '',
        startDate: '',
        intervalDays: '7',
        deliveryDetails: '',
        securityDeposit: '',
        isAutoDeposit: true
    });

    const [pendingCount, setPendingCount] = useState(0);
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

    useEffect(() => {
        getCateringRequests().then(res => {
            if (res.success) setPendingCount(res.requests.length);
        });
    }, []);

    const citizenTotals = useMemo(() => {
        const subtotal = citizenForm.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountPct = parseFloat(citizenForm.discount) || 0;
        const discountAmount = (subtotal * discountPct) / 100;
        const discountedBase = subtotal - discountAmount;

        const surchargeInfo = calculateBulkOrderSurcharge(discountedBase, citizenForm.deliveryDate);

        return {
            subtotal,
            discountAmount,
            discountedBase,
            surcharge: surchargeInfo.surcharge,
            total: citizenForm.isAutoFine ? surchargeInfo.total : (parseFloat(citizenForm.customTotal) || 0),
            surchargeMsg: surchargeInfo.msg,
            surchargeType: surchargeInfo.type
        };
    }, [citizenForm]);

    const recurringTotals = useMemo(() => {
        const subtotal = recurringForm.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountPct = parseFloat(recurringForm.discount) || 0;
        const discountAmount = (subtotal * discountPct) / 100;
        const deliveryAmount = subtotal - discountAmount;
        const autoDeposit = deliveryAmount * 2;

        return {
            subtotal,
            discountAmount,
            deliveryAmount,
            autoDeposit,
            finalDeposit: recurringForm.isAutoDeposit ? autoDeposit : (parseFloat(recurringForm.securityDeposit) || 0)
        };
    }, [recurringForm]);

    const handleCitizenSubmit = useCallback(async (e: React.FormEvent, overrideAmount?: string, formattedDetails?: string) => {
        setLoading(true);
        const res = await createCitizenOrder({
            to: citizenForm.to,
            amount: overrideAmount || '0',
            eventDate: citizenForm.deliveryDate,
            details: formattedDetails || ''
        });
        setLoading(false);
        if (res.success) {
            toast({ title: 'Success', description: `Order #${res.orderId} created successfully.` });
            setCitizenForm({ to: '', deliveryDate: '', items: [], discount: '0', isAutoFine: true, customTotal: '' });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: res.error });
        }
    }, [citizenForm, toast]);

    const handleRecurringSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Format Items
        const fmt = (n: number) => `$ ${n.toLocaleString('en-US')}`;
        let itemsText = "RECURRING ITEMS:\n";
        recurringForm.items.forEach((item, i) => {
            itemsText += `${i + 1}. ${item.description.padEnd(25)} x${item.quantity.toString().padEnd(4)}\n`;
        });
        itemsText += `Subtotal: ${fmt(recurringTotals.subtotal)}\n`;
        if (recurringTotals.discountAmount > 0) {
            itemsText += `Discount (${recurringForm.discount}%): -${fmt(recurringTotals.discountAmount)}\n`;
        }
        itemsText += `Delivery Total: ${fmt(recurringTotals.deliveryAmount)}\n`;
        if (recurringTotals.finalDeposit > 0) {
            itemsText += `Security Deposit: ${fmt(recurringTotals.finalDeposit)}\n`;
        }

        const res = await createRecurringOrder({
            ...recurringForm,
            items: itemsText,
            amount: recurringTotals.deliveryAmount.toString(),
            intervalDays: parseInt(recurringForm.intervalDays),
            securityDeposit: recurringTotals.finalDeposit
        });
        setLoading(false);
        if (res.success) {
            toast({ title: 'Success', description: 'Recurring Contract created.' });
            setRecurringForm({
                customer: '',
                clientRep: '',
                items: [],
                discount: '0',
                amount: '',
                startDate: '',
                intervalDays: '7',
                deliveryDetails: '',
                securityDeposit: '',
                isAutoDeposit: true
            });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: res.error });
        }
    }, [recurringForm, recurringTotals, toast]);


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
        // Optimistic Update
        setLocalOrders(prev => prev.map(o => o.orderId === order.orderId ? { ...o, status: newStatus } : o));

        const res = await updateOrderStatus(order.orderId, order.messageId, order.channelId, newStatus, reason);

        if (res.success) {
            toast({ title: 'Updated', description: `Order marked as ${newStatus}` });
            if (newStatus === 'Cancelled') setIsCancelDialogOpen(false);
        } else {
            // Revert on failure
            setLocalOrders(prev => prev.map(o => o.orderId === order.orderId ? { ...o, status: order.status } : o));
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

    const filteredActiveOrders = useMemo(() => localOrders.filter(o => o.status !== 'Cancelled'), [localOrders]);

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
                                <TabsList className="bg-black/40 w-full justify-start border-b border-white/5 rounded-none p-0 h-10 overflow-x-auto flex-nowrap">
                                    <TabsTrigger value="pending" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent">Pending</TabsTrigger>
                                    <TabsTrigger value="progress" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent">On Progress</TabsTrigger>
                                    <TabsTrigger value="completed" className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent">Completed</TabsTrigger>
                                    <TabsTrigger value="cancelled" className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:bg-transparent">Cancelled</TabsTrigger>
                                </TabsList>

                                {['pending', 'progress', 'completed', 'cancelled'].map(statusTab => (
                                    <TabsContent key={statusTab} value={statusTab} className="pt-4">
                                        <ScrollArea className="h-[600px] pr-4">
                                            <div className="space-y-3">
                                                {localOrders.filter(o =>
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

                                    // Format Details
                                    const fmt = (n: number) => `$ ${n.toLocaleString('en-US')}`;
                                    let detailsText = "ORDER ITEMS:\n------------------------------------------\n";
                                    citizenForm.items.forEach((item, i) => {
                                        detailsText += `${i + 1}. ${item.description.padEnd(30)} x${item.quantity.toString().padEnd(5)}\n`;
                                    });
                                    detailsText += "------------------------------------------\n";
                                    detailsText += `Subtotal: ${fmt(citizenTotals.subtotal)}\n`;
                                    if (citizenTotals.discountAmount > 0) {
                                        detailsText += `Discount (${citizenForm.discount}%): -${fmt(citizenTotals.discountAmount)}\n`;
                                    }
                                    if (citizenForm.isAutoFine) {
                                        detailsText += `Surcharge (${citizenTotals.surchargeMsg}): +${fmt(citizenTotals.surcharge)}\n`;
                                    }
                                    detailsText += `GRAND TOTAL: ${fmt(citizenTotals.total)}\n`;
                                    detailsText += `Delivery Date: ${citizenForm.deliveryDate}\n`;

                                    handleCitizenSubmit(e, citizenTotals.total.toString(), detailsText);
                                }} className="space-y-4 p-4 bg-black/20 rounded-lg border border-white/5">
                                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-accent" /> Create Citizen Bulk Order
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Customer / Organization Name</Label>
                                            <Input required placeholder="Ex. John Doe / Taxi Cab Co." value={citizenForm.to} onChange={e => setCitizenForm({ ...citizenForm, to: e.target.value })} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="flex justify-between items-center text-accent/90">
                                                Order Items
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCitizenForm(prev => ({ ...prev, items: [...prev.items, { description: '', quantity: 1, price: 0 }] }))}
                                                    className="h-7 text-xs border-dashed"
                                                >
                                                    <Plus className="w-3 h-3 mr-1" /> Add Item
                                                </Button>
                                            </Label>
                                            <div className="space-y-2 border border-white/5 p-2 rounded-lg bg-black/40 max-h-[300px] overflow-y-auto">
                                                {citizenForm.items.length === 0 && <p className="text-center py-4 text-xs text-muted-foreground">No items added yet.</p>}
                                                {citizenForm.items.map((item, index) => (
                                                    <div key={index} className="grid grid-cols-12 gap-2 items-center bg-white/5 p-2 rounded border border-white/5 group">
                                                        <div className="col-span-6">
                                                            <Input placeholder="Item Name" className="h-8 text-xs bg-black/40 border-white/10" value={item.description} onChange={e => {
                                                                const newItems = [...citizenForm.items];
                                                                newItems[index].description = e.target.value;
                                                                setCitizenForm({ ...citizenForm, items: newItems });
                                                            }} required />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <Input type="number" placeholder="Qty" className="h-8 text-xs bg-black/40 border-white/10 text-center" value={item.quantity} onChange={e => {
                                                                const newItems = [...citizenForm.items];
                                                                newItems[index].quantity = parseInt(e.target.value) || 0;
                                                                setCitizenForm({ ...citizenForm, items: newItems });
                                                            }} required min="1" />
                                                        </div>
                                                        <div className="col-span-3">
                                                            <Input type="number" placeholder="Price" className="h-8 text-xs bg-black/40 border-white/10 text-center" value={item.price} onChange={e => {
                                                                const newItems = [...citizenForm.items];
                                                                newItems[index].price = parseFloat(e.target.value) || 0;
                                                                setCitizenForm({ ...citizenForm, items: newItems });
                                                            }} required min="0" />
                                                        </div>
                                                        <div className="col-span-1 flex justify-center">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-red-400 opacity-50 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => {
                                                                    const newItems = [...citizenForm.items];
                                                                    newItems.splice(index, 1);
                                                                    setCitizenForm({ ...citizenForm, items: newItems });
                                                                }}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Delivery Date</Label>
                                                <Input required type="date" value={citizenForm.deliveryDate} onChange={e => setCitizenForm({ ...citizenForm, deliveryDate: e.target.value })} />
                                                <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Info className="w-3 h-3" /> Used for notice-period surcharge calculation.</p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Discount (%)</Label>
                                                <Input type="number" placeholder="0" value={citizenForm.discount} onChange={e => setCitizenForm({ ...citizenForm, discount: e.target.value })} />
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg border border-white/5">
                                            <Checkbox
                                                id="autoFine"
                                                checked={citizenForm.isAutoFine}
                                                onCheckedChange={(checked) => setCitizenForm({ ...citizenForm, isAutoFine: !!checked })}
                                                className="w-5 h-5" // Larger checkbox
                                            />
                                            <Label htmlFor="autoFine" className="text-sm font-medium cursor-pointer">
                                                Automatic Fine Calculation
                                            </Label>
                                        </div>

                                        {!citizenForm.isAutoFine && (
                                            <div className="space-y-2 p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                                                <Label className="text-orange-400">Custom Total Amount ($)</Label>
                                                <Input required type="number" placeholder="Overwrite total price" value={citizenForm.customTotal} onChange={e => setCitizenForm({ ...citizenForm, customTotal: e.target.value })} />
                                                <p className="text-[10px] text-orange-400/70">Manual total will override subtotal + surcharge.</p>
                                            </div>
                                        )}

                                        <div className="p-4 bg-black/40 rounded-lg border border-white/10 space-y-2 shadow-inner">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground">Item Subtotal:</span>
                                                <span className="font-mono text-white">${citizenTotals.subtotal.toLocaleString()}</span>
                                            </div>
                                            {citizenTotals.discountAmount > 0 && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Discount ({citizenForm.discount}%):</span>
                                                    <span className="font-mono text-red-400">-${citizenTotals.discountAmount.toLocaleString()}</span>
                                                </div>
                                            )}
                                            {citizenForm.isAutoFine && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Surcharge ({citizenTotals.surchargeMsg}):</span>
                                                    <span className="font-mono text-orange-400">+${citizenTotals.surcharge.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                                <span className="font-bold text-accent">GRAND TOTAL:</span>
                                                <span className="font-bold text-xl text-green-400 font-mono">${citizenTotals.total.toLocaleString()}</span>
                                            </div>
                                            {citizenForm.isAutoFine && (
                                                <p className="text-[10px] text-center text-muted-foreground italic pt-1">{citizenTotals.surchargeType}</p>
                                            )}
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={loading || citizenForm.items.length === 0} className="w-full bg-accent hover:bg-accent/90 text-white font-bold h-12 shadow-lg shadow-accent/20 transition-all active:scale-[0.98]">
                                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />} Create Order
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
                                        <li>List all items clearly in standard format (e.g. 100x KOIs).</li>
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
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="flex justify-between items-center text-green-400/90">
                                                Contract Items
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setRecurringForm(prev => ({ ...prev, items: [...prev.items, { description: '', quantity: 1, price: 0 }] }))}
                                                    className="h-7 text-xs border-dashed border-green-500/30 text-green-400 hover:bg-green-500/10"
                                                >
                                                    <Plus className="w-3 h-3 mr-1" /> Add Item
                                                </Button>
                                            </Label>
                                            <div className="space-y-2 border border-white/5 p-2 rounded-lg bg-black/40 max-h-[300px] overflow-y-auto">
                                                {recurringForm.items.length === 0 && <p className="text-center py-4 text-xs text-muted-foreground">No items added to contract.</p>}
                                                {recurringForm.items.map((item, index) => (
                                                    <div key={index} className="grid grid-cols-12 gap-2 items-center bg-white/5 p-2 rounded border border-white/5 group">
                                                        <div className="col-span-6">
                                                            <Input placeholder="Item Name" className="h-8 text-xs bg-black/40 border-white/10" value={item.description} onChange={e => {
                                                                const newItems = [...recurringForm.items];
                                                                newItems[index].description = e.target.value;
                                                                setRecurringForm({ ...recurringForm, items: newItems });
                                                            }} required />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <Input type="number" placeholder="Qty" className="h-8 text-xs bg-black/40 border-white/10 text-center" value={item.quantity} onChange={e => {
                                                                const newItems = [...recurringForm.items];
                                                                newItems[index].quantity = parseInt(e.target.value) || 0;
                                                                setRecurringForm({ ...recurringForm, items: newItems });
                                                            }} required min="1" />
                                                        </div>
                                                        <div className="col-span-3">
                                                            <Input type="number" placeholder="Price" className="h-8 text-xs bg-black/40 border-white/10 text-center" value={item.price} onChange={e => {
                                                                const newItems = [...recurringForm.items];
                                                                newItems[index].price = parseFloat(e.target.value) || 0;
                                                                setRecurringForm({ ...recurringForm, items: newItems });
                                                            }} required min="0" />
                                                        </div>
                                                        <div className="col-span-1 flex justify-center">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-red-400 opacity-50 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => {
                                                                    const newItems = [...recurringForm.items];
                                                                    newItems.splice(index, 1);
                                                                    setRecurringForm({ ...recurringForm, items: newItems });
                                                                }}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Discount (%)</Label>
                                                <Input type="number" placeholder="0" value={recurringForm.discount} onChange={e => setRecurringForm({ ...recurringForm, discount: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Security Deposit ($)</Label>
                                                <Input
                                                    type="number"
                                                    placeholder={recurringForm.isAutoDeposit ? "Auto-calculated" : "Custom amount"}
                                                    value={recurringForm.isAutoDeposit ? recurringTotals.autoDeposit : recurringForm.securityDeposit}
                                                    onChange={e => !recurringForm.isAutoDeposit && setRecurringForm({ ...recurringForm, securityDeposit: e.target.value })}
                                                    disabled={recurringForm.isAutoDeposit}
                                                    className={recurringForm.isAutoDeposit ? "bg-black/20 text-muted-foreground cursor-not-allowed" : ""}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg border border-white/5">
                                            <Checkbox
                                                id="autoDeposit"
                                                checked={recurringForm.isAutoDeposit}
                                                onCheckedChange={(checked) => setRecurringForm({ ...recurringForm, isAutoDeposit: !!checked })}
                                                className="w-5 h-5"
                                            />
                                            <Label htmlFor="autoDeposit" className="text-sm font-medium cursor-pointer">
                                                Automatic Security Deposit (2x Delivery Amount)
                                            </Label>
                                        </div>

                                        <div className="p-4 bg-black/40 rounded-lg border border-green-500/10 space-y-2 shadow-inner">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground">Contract Subtotal:</span>
                                                <span className="font-mono text-white">${recurringTotals.subtotal.toLocaleString()}</span>
                                            </div>
                                            {recurringTotals.discountAmount > 0 && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Discount ({recurringForm.discount}%):</span>
                                                    <span className="font-mono text-red-400">-${recurringTotals.discountAmount.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                                <span className="font-bold text-green-400">AMOUNT PER DELIVERY:</span>
                                                <span className="font-bold text-xl text-green-400 font-mono">${recurringTotals.deliveryAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground">Security Deposit:</span>
                                                <span className="font-mono text-orange-400">${recurringTotals.finalDeposit.toLocaleString()}</span>
                                            </div>
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
                                        <Label>Delivery Details (Location/Time)</Label>
                                        <Input placeholder="Ex. Vespucci PD HQ @ 8 PM" value={recurringForm.deliveryDetails} onChange={e => setRecurringForm({ ...recurringForm, deliveryDetails: e.target.value })} />
                                    </div>
                                    <Button type="submit" disabled={loading || recurringForm.items.length === 0} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 shadow-lg shadow-green-500/20 transition-all active:scale-[0.98]">
                                        {loading ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="w-5 h-5 mr-2" />} Create Contract
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
