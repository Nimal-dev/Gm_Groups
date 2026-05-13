'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
    Package, Users, ShoppingCart, RefreshCw,
    Loader2, LogOut, Clock, X, CheckCircle2, Search,
    BarChart3, Receipt
} from 'lucide-react';

import VendorReportsGenerator from './VendorReportsGenerator';


interface VendorDashboardClientProps {
    vendorRole: string; // MLB or YKZ
    vendorName: string;
}

const STATUS_FLOW = ['Pending', 'Order Confirmed', 'Packing', 'Out for Delivery', 'Delivered', 'Payment Complete'];

const STATUS_COLORS: Record<string, string> = {
    'Pending': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    'Order Confirmed': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    'Packing': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    'Out for Delivery': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    'Delivered': 'bg-green-500/10 text-green-400 border-green-500/30',
    'Payment Complete': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    'Cancelled': 'bg-red-500/10 text-red-400 border-red-500/30',
};

export default function VendorDashboardClient({ vendorRole, vendorName }: VendorDashboardClientProps) {
    const { toast } = useToast();
    const router = useRouter();

    // Inventory state
    const [inventory, setInventory] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [localPrices, setLocalPrices] = useState<Record<string, string>>({});
    const [savingPriceId, setSavingPriceId] = useState<string | null>(null);
    const [loadingInventory, setLoadingInventory] = useState(true);

    // Orders state
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [cancelModal, setCancelModal] = useState<any>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

    // Staff state
    const [staffList, setStaffList] = useState<any[]>([]);
    const [loadingStaff, setLoadingStaff] = useState(true);

    // Bills state
    const [bills, setBills] = useState<any[]>([]);
    const [loadingBills, setLoadingBills] = useState(true);
    const [selectedBill, setSelectedBill] = useState<any>(null);


    const fetchInventory = useCallback(async () => {
        setLoadingInventory(true);
        try {
            const mod = await import('@/actions/vendor');
            const res = await mod.getVendorInventory(vendorRole);
            if (res.success) {
                setInventory(res.items);
                // Initialize local prices
                const prices: Record<string, string> = {};
                res.items.forEach((item: any) => {
                    prices[item._id] = String(item.price);
                });
                setLocalPrices(prices);
            }
        } catch (e) { console.error(e); }
        setLoadingInventory(false);
    }, [vendorRole]);

    const fetchOrders = useCallback(async () => {
        setLoadingOrders(true);
        try {
            const mod = await import('@/actions/vendor');
            const res = await mod.getVendorOrders(vendorRole);
            if (res.success) setOrders(res.orders);
        } catch (e) { console.error(e); }
        setLoadingOrders(false);
    }, [vendorRole]);

    const fetchStaff = useCallback(async () => {
        setLoadingStaff(true);
        try {
            const mod = await import('@/actions/dashboard');
            const res = await mod.getLiveActiveStaff();
            if (res.success && res.activeStaff) setStaffList(res.activeStaff);
        } catch (e) { console.error(e); }
        setLoadingStaff(false);
    }, []);

    const fetchBills = useCallback(async () => {
        setLoadingBills(true);
        try {
            const mod = await import('@/actions/vendor');
            const res = await mod.getVendorBills(vendorRole);
            if (res.success) setBills(res.bills);
        } catch (e) { console.error(e); }
        setLoadingBills(false);
    }, [vendorRole]);

    useEffect(() => {
        fetchInventory();
        fetchOrders();
        fetchStaff();
        fetchBills();
        const interval = setInterval(() => { if (!document.hidden) { fetchOrders(); fetchStaff(); fetchBills(); } }, 60000);
        return () => clearInterval(interval);
    }, [fetchInventory, fetchOrders, fetchStaff, fetchBills]);


    // Inventory handlers
    const handleUpdatePrice = async (id: string, price: string) => {
        if (!price || isNaN(parseFloat(price))) {
            toast({ title: 'Error', description: 'Invalid price', variant: 'destructive' });
            return;
        }
        setSavingPriceId(id);
        try {
            const mod = await import('@/actions/vendor');
            const res = await mod.updateVendorInventoryItem({ 
                id, 
                price: parseFloat(price) 
            });
            if (res.success) { 
                toast({ title: 'Price Updated', className: 'bg-green-600 border-none' }); 
                // Update local state instead of full fetch to avoid resetting other unsaved inputs
                setInventory(prev => prev.map(item => 
                    item._id === id ? { ...item, price: parseFloat(price) } : item
                ));
            } else {
                throw new Error(res.error);
            }
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
        setSavingPriceId(null);
    };



    // Order handlers
    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdatingOrder(orderId);
        try {
            const mod = await import('@/actions/vendor');
            const res = await mod.updateOrderStatus(orderId, newStatus);
            if (res.success) { toast({ title: 'Status Updated', className: 'bg-green-600 border-none' }); fetchOrders(); }
            else throw new Error(res.error);
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
        setUpdatingOrder(null);
    };

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            toast({ title: 'Error', description: 'Please provide a reason.', variant: 'destructive' });
            return;
        }
        setUpdatingOrder(cancelModal._id);
        try {
            const mod = await import('@/actions/vendor');
            const res = await mod.cancelOrder(cancelModal._id, cancelReason, vendorName);
            if (res.success) { toast({ title: 'Order Cancelled', className: 'bg-red-600 border-none' }); fetchOrders(); }
            else throw new Error(res.error);
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
        setCancelModal(null);
        setCancelReason('');
        setCancelReason('');
        setUpdatingOrder(null);
    };

    const handleSendBill = async (order: any) => {
        setUpdatingOrder(order._id);
        try {
            const bankAccount = vendorRole === 'MLB' ? '9144066578' : '6838311307';
            const mod = await import('@/actions/vendor');
            const res = await mod.createVendorBill({
                orderId: order._id,
                vendorRole: vendorRole as 'MLB' | 'YKZ',
                items: order.items.map((i: any) => ({
                    itemName: i.itemName,
                    quantity: i.quantity,
                    price: i.price
                })),
                totalPrice: order.grandTotal,
                bankAccount,
                sentBy: vendorName
            });

            if (res.success) {
                toast({ title: 'Bill Sent', description: 'Bill details have been sent to admin and Discord.', className: 'bg-green-600 border-none' });
                fetchOrders();
            } else {
                throw new Error(res.error);
            }
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
        setUpdatingOrder(null);
    };

    const activeOrders = orders.filter(o => !['Cancelled', 'Payment Complete'].includes(o.status));
    const pastOrders = orders.filter(o => ['Cancelled', 'Payment Complete'].includes(o.status));

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">
                        {vendorRole} Vendor Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Welcome back, {vendorName}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-emerald-400 border-emerald-500/50 bg-emerald-500/10 px-3 py-1">
                        {vendorRole}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/vendor-login' })} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass-card border-emerald-500/20">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-emerald-400">{activeOrders.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">Active Orders</p>
                    </CardContent>
                </Card>
                <Card className="glass-card border-blue-500/20">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-blue-400">{inventory.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">Inventory Items</p>
                    </CardContent>
                </Card>
                <Card className="glass-card border-purple-500/20">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-purple-400">{staffList.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">KOI Staff Online</p>
                    </CardContent>
                </Card>
                <Card className="glass-card border-orange-500/20">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-orange-400">{pastOrders.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">Completed/Cancelled</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="orders" className="space-y-6">
                <div className="overflow-x-auto pb-2">
                    <TabsList className="glass-card bg-transparent border-0 p-1 w-max">
                        <TabsTrigger value="orders" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 relative">
                            Orders
                            {activeOrders.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="inventory" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">Inventory</TabsTrigger>
                        <TabsTrigger value="staff" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">Live Staff</TabsTrigger>
                        <TabsTrigger value="reports" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">Reports</TabsTrigger>
                        <TabsTrigger value="bills" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">Bills</TabsTrigger>
                    </TabsList>
                </div>

                {/* ORDERS TAB */}
                <TabsContent value="orders" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-emerald-400" /> Active Orders</h2>
                        <Button variant="ghost" size="sm" onClick={fetchOrders} className="text-muted-foreground"><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
                    </div>

                    {loadingOrders ? (
                        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-emerald-400" /></div>
                    ) : activeOrders.length === 0 ? (
                        <Card className="glass-card"><CardContent className="py-16 text-center text-muted-foreground"><ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No active orders</p></CardContent></Card>
                    ) : (
                        <div className="space-y-4">
                            {activeOrders.map(order => (
                                <Card key={order._id} className="glass-card border-l-4 border-l-emerald-500">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex flex-col md:flex-row justify-between gap-2">
                                            <div>
                                                <p className="font-bold text-white">{order.requestedByName}</p>
                                                <p className="text-xs text-muted-foreground font-mono">Order #{order._id?.slice(-8)}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString('en-GB')}</p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <Badge className={`${STATUS_COLORS[order.status] || ''} border`}>{order.status}</Badge>
                                                <p className="text-lg font-bold font-mono text-emerald-400">${order.grandTotal?.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {/* Items list */}
                                        <div className="bg-black/20 rounded-lg p-3">
                                            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Items Requested</p>
                                            <div className="space-y-2">
                                                {order.items?.map((item: any, i: number) => (
                                                    <div key={i} className="flex flex-col gap-1 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-white font-medium whitespace-pre-wrap">{item.itemName}</span>
                                                            <div className="flex items-center gap-2">
                                                                {item.quantity > 1 && <span className="text-emerald-400 text-xs">x{item.quantity}</span>}
                                                                {!order.billSent ? (
                                                                    <div className="flex items-center bg-black/40 rounded border border-white/10 px-2 h-7">
                                                                        <span className="text-[10px] text-muted-foreground mr-1">$</span>
                                                                        <input 
                                                                            type="number"
                                                                            value={item.price || 0}
                                                                            onChange={(e) => {
                                                                                const newPrice = parseFloat(e.target.value) || 0;
                                                                                const updatedOrders = orders.map(o => {
                                                                                    if (o._id === order._id) {
                                                                                        const newItems = [...o.items];
                                                                                        newItems[i] = { ...newItems[i], price: newPrice };
                                                                                        const newTotal = newItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);
                                                                                        return { ...o, items: newItems, grandTotal: newTotal };
                                                                                    }
                                                                                    return o;
                                                                                });
                                                                                setOrders(updatedOrders);
                                                                            }}
                                                                            className="bg-transparent border-none text-right w-14 text-xs font-mono text-emerald-400 focus:outline-none focus:ring-0 p-0"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <span className="font-mono text-xs text-emerald-400">${(item.price * item.quantity).toLocaleString()}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {order.notes && <p className="text-xs italic text-muted-foreground bg-white/5 p-2 rounded">Note: {order.notes}</p>}

                                         {/* Status actions */}
                                         <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
                                             <div className="flex items-center gap-2">
                                                 <Label className="text-[10px] text-muted-foreground uppercase whitespace-nowrap">Update Status</Label>
                                                 <Select 
                                                     value={order.status} 
                                                     onValueChange={(val) => handleStatusUpdate(order._id, val)}
                                                     disabled={updatingOrder === order._id}
                                                 >
                                                     <SelectTrigger className="h-8 w-[180px] bg-white/5 border-white/10 text-xs">
                                                         <SelectValue placeholder="Status" />
                                                     </SelectTrigger>
                                                     <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                                         {STATUS_FLOW.map(status => (
                                                             <SelectItem key={status} value={status} className="text-xs hover:bg-emerald-500/20">
                                                                 {status}
                                                             </SelectItem>
                                                         ))}
                                                         <SelectItem value="Cancelled" className="text-xs text-red-400 hover:bg-red-500/20">Cancelled</SelectItem>
                                                     </SelectContent>
                                                 </Select>
                                             </div>

                                             {['Out for Delivery', 'Delivered'].includes(order.status) && !order.billSent && (
                                                 <Button size="sm" onClick={() => handleSendBill(order)}
                                                     disabled={updatingOrder === order._id}
                                                     className="text-xs h-8 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">
                                                     <Package className="w-3 h-3 mr-1" /> Send Bill
                                                 </Button>
                                             )}

                                             {order.billSent && (
                                                 <Badge variant="outline" className="text-blue-400 border-blue-500/30 bg-blue-500/5">
                                                     Bill Sent
                                                 </Badge>
                                             )}

                                             {!['Delivered', 'Payment Complete', 'Cancelled'].includes(order.status) && (
                                                 <Button size="sm" variant="ghost" onClick={() => setCancelModal(order)}
                                                     className="text-xs h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                                     <X className="w-3 h-3 mr-1" /> Cancel Order
                                                 </Button>
                                             )}
                                         </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Past Orders */}
                    {pastOrders.length > 0 && (
                        <div className="mt-8 space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Past Orders</h3>
                            {pastOrders.slice(0, 10).map(order => (
                                <div key={order._id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-3 rounded-lg bg-white/5 border border-white/5 opacity-70 hover:opacity-100 transition-opacity">
                                    <div>
                                        <p className="font-semibold text-sm">{order.requestedByName}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 md:mt-0">
                                        <Badge className={`${STATUS_COLORS[order.status] || ''} border text-[10px]`}>{order.status}</Badge>
                                        <span className="font-mono text-sm">${order.grandTotal?.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* INVENTORY TAB */}
                <TabsContent value="inventory" className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Package className="w-5 h-5 text-emerald-400" /> Inventory Pricing
                        </h2>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search raw materials..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-black/40 border-white/10 focus:ring-emerald-500/50"
                            />
                        </div>
                    </div>

                    {loadingInventory ? (
                        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-emerald-400" /></div>
                    ) : inventory.filter(item => item.itemName.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                        <Card className="glass-card"><CardContent className="py-16 text-center text-muted-foreground"><Package className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>{searchTerm ? 'No materials match your search.' : 'No inventory items yet.'}</p></CardContent></Card>
                    ) : (
                        <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden glass-card overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-white/5">
                                    <TableRow className="border-white/10 hover:bg-transparent">
                                        <TableHead className="text-muted-foreground font-semibold py-4 px-4 md:px-6">Raw Material</TableHead>
                                        <TableHead className="text-muted-foreground font-semibold py-4 hidden sm:table-cell">Unit</TableHead>
                                        <TableHead className="text-right text-muted-foreground font-semibold py-4 px-4 md:px-6">Price ($)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inventory
                                        .filter(item => item.itemName.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map(item => (
                                        <TableRow key={item._id} className="border-white/10 hover:bg-white/5 transition-colors group">
                                            <TableCell className="font-medium text-white py-4 px-4 md:px-6">
                                                {item.itemName}
                                                <div className="sm:hidden text-xs text-muted-foreground mt-0.5 italic">{item.unit}</div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground py-4 italic text-sm hidden sm:table-cell">{item.unit}</TableCell>
                                            <TableCell className="text-right py-4 px-4 md:px-6">
                                                <div className="flex items-center justify-end gap-2 md:gap-3">
                                                    <div className="relative">
                                                        <Input 
                                                            type="number" 
                                                            value={localPrices[item._id] || ''} 
                                                            onChange={(e) => setLocalPrices(prev => ({...prev, [item._id]: e.target.value}))}
                                                            className="w-20 md:w-28 h-9 bg-black/40 border-white/10 text-emerald-400 font-mono text-right focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all pr-2"
                                                        />
                                                    </div>
                                                    <Button 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        className={`h-9 w-9 transition-all duration-300 rounded-lg shrink-0 ${
                                                            localPrices[item._id] === String(item.price) 
                                                            ? 'text-muted-foreground/20' 
                                                            : 'text-emerald-400 hover:bg-white hover:text-emerald-600 hover:scale-110 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                                        }`}
                                                        disabled={savingPriceId === item._id || localPrices[item._id] === String(item.price)}
                                                        onClick={() => handleUpdatePrice(item._id, localPrices[item._id])}
                                                    >
                                                        {savingPriceId === item._id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <CheckCircle2 className={`w-4 h-4 ${localPrices[item._id] !== String(item.price) ? 'animate-pulse' : ''}`} />
                                                        )}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>

                {/* STAFF TAB */}
                <TabsContent value="staff" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold flex items-center gap-2"><Users className="w-5 h-5 text-emerald-400" /> KOI Cafe Staff Online</h2>
                        <Button variant="ghost" size="sm" onClick={fetchStaff} className="text-muted-foreground"><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
                    </div>

                    {loadingStaff ? (
                        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-emerald-400" /></div>
                    ) : staffList.length === 0 ? (
                        <Card className="glass-card"><CardContent className="py-16 text-center text-muted-foreground"><Users className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No staff currently on duty.</p></CardContent></Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {staffList.map((staff: any) => (
                                <Card key={staff.userId} className="glass-card">
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                        <div>
                                            <p className="font-medium text-sm text-white">{staff.displayName || staff.username}</p>
                                            <p className="text-xs text-muted-foreground font-mono">{staff.rank}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* REPORTS TAB */}
                <TabsContent value="reports" className="space-y-6">
                    <VendorReportsGenerator vendorRole={vendorRole} />
                </TabsContent>

                {/* BILLS TAB */}
                <TabsContent value="bills" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold flex items-center gap-2"><Receipt className="w-5 h-5 text-emerald-400" /> My Bills</h2>
                        <Button variant="ghost" size="sm" onClick={fetchBills} className="text-muted-foreground"><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
                    </div>

                    {loadingBills ? (
                        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-emerald-400" /></div>
                    ) : bills.length === 0 ? (
                        <Card className="glass-card"><CardContent className="py-16 text-center text-muted-foreground"><Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No bills sent yet.</p></CardContent></Card>
                    ) : (
                        <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden glass-card overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-white/5">
                                    <TableRow className="border-white/10 hover:bg-transparent">
                                        <TableHead className="text-muted-foreground font-semibold py-4 px-6">Bill ID</TableHead>
                                        <TableHead className="text-muted-foreground font-semibold py-4">Date</TableHead>
                                        <TableHead className="text-muted-foreground font-semibold py-4">Amount</TableHead>
                                        <TableHead className="text-muted-foreground font-semibold py-4">Status</TableHead>
                                        <TableHead className="text-right text-muted-foreground font-semibold py-4 px-6">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bills.map((bill: any) => (
                                        <TableRow key={bill._id} className="border-white/10 hover:bg-white/5 transition-colors">
                                            <TableCell className="font-mono text-xs text-white py-4 px-6">#{bill._id.slice(-8)}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm py-4">{new Date(bill.createdAt).toLocaleDateString('en-GB')}</TableCell>
                                            <TableCell className="font-bold text-white py-4">${bill.totalPrice.toLocaleString()}</TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="outline" className={bill.status === 'Paid' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'}>
                                                    {bill.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right py-4 px-6">
                                                <Button size="sm" variant="ghost" onClick={() => setSelectedBill(bill)} className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 h-8">
                                                    Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>
            </Tabs>





            {/* Cancel Order Dialog */}
            <Dialog open={!!cancelModal} onOpenChange={(open) => { if (!open) { setCancelModal(null); setCancelReason(''); } }}>
                <DialogContent className="sm:max-w-[400px] bg-black/80 backdrop-blur-2xl border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-red-400">Cancel Order</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        <p className="text-sm text-muted-foreground">Order from <strong className="text-white">{cancelModal?.requestedByName}</strong></p>
                        <Label className="text-xs text-zinc-400 uppercase">Reason for Cancellation</Label>
                        <Textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                            className="bg-white/5 border-white/10 text-white" placeholder="Enter reason..." />
                    </div>
                    <DialogFooter>
                        <Button variant="destructive" onClick={handleCancelOrder} disabled={!!updatingOrder} className="w-full">
                            {updatingOrder ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />}
                            Confirm Cancellation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bill Details Dialog */}
            <Dialog open={!!selectedBill} onOpenChange={(open) => { if (!open) setSelectedBill(null); }}>
                <DialogContent className="sm:max-w-[500px] bg-black/80 backdrop-blur-2xl border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-emerald-400" />
                            Bill Details #{selectedBill?._id.slice(-8)}
                        </DialogTitle>
                        <CardDescription>Generated by {selectedBill?.sentBy} on {selectedBill && new Date(selectedBill.createdAt).toLocaleString('en-GB')}</CardDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase">Payment Status</p>
                                <Badge variant="outline" className={selectedBill?.status === 'Paid' ? 'bg-green-500/10 text-green-400 border-green-500/30 mt-1' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 mt-1'}>
                                    {selectedBill?.status}
                                </Badge>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-muted-foreground uppercase">Total Amount</p>
                                <p className="text-xl font-bold text-emerald-400 mt-1">${selectedBill?.totalPrice.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Billed Items</p>
                            <ScrollArea className="h-[200px] rounded-lg border border-white/5 bg-black/20 p-2">
                                {selectedBill?.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-2 border-b border-white/5 last:border-0">
                                        <div>
                                            <p className="text-sm font-medium">{item.itemName}</p>
                                            <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-mono text-white">${(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </ScrollArea>
                        </div>

                        <div className="bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                            <p className="text-[10px] text-emerald-400 uppercase font-semibold">Bank Account</p>
                            <p className="text-sm font-mono mt-1 text-white">{selectedBill?.bankAccount}</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setSelectedBill(null)} className="w-full text-zinc-400">
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

