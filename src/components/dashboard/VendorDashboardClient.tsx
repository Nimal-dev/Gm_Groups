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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
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
    BarChart3, Receipt, Calendar, DollarSign, FileText, Hash, User,
    Copy, Check, ArrowUpRight, TrendingUp, AlertCircle, Eye
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
    const [billSearchTerm, setBillSearchTerm] = useState('');
    const [billStatusFilter, setBillStatusFilter] = useState<'All' | 'Paid' | 'Unpaid'>('All');

    // Orders Details drawer state
    const [selectedOrder, setSelectedOrder] = useState<any>(null);


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
            const bankAccount = vendorRole === 'MLB' ? '7732894620' : '6838311307';
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

    // Bills calculations
    const totalBillsSum = bills.reduce((acc, bill) => acc + (bill.totalPrice || 0), 0);
    const totalBillsCount = bills.length;

    const paidBills = bills.filter(bill => bill.status === 'Paid');
    const paidBillsSum = paidBills.reduce((acc, bill) => acc + (bill.totalPrice || 0), 0);
    const paidBillsCount = paidBills.length;

    const unpaidBills = bills.filter(bill => bill.status === 'Unpaid');
    const unpaidBillsSum = unpaidBills.reduce((acc, bill) => acc + (bill.totalPrice || 0), 0);
    const unpaidBillsCount = unpaidBills.length;

    const filteredBills = bills.filter(bill => {
        if (billStatusFilter === 'Paid' && bill.status !== 'Paid') return false;
        if (billStatusFilter === 'Unpaid' && bill.status !== 'Unpaid') return false;

        if (billSearchTerm) {
            const query = billSearchTerm.toLowerCase();
            const idMatch = bill._id.toLowerCase().includes(query);
            const orderMatch = bill.orderId?.toLowerCase().includes(query);
            const sentByMatch = bill.sentBy?.toLowerCase().includes(query);
            const amountMatch = bill.totalPrice.toString().includes(query);
            return idMatch || orderMatch || sentByMatch || amountMatch;
        }
        return true;
    });

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
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col items-end gap-1">
                                                    <Badge className={`${STATUS_COLORS[order.status] || ''} border text-xs`}>{order.status}</Badge>
                                                    <p className="text-lg font-bold font-mono text-emerald-400">${order.grandTotal?.toLocaleString()}</p>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="text-xs h-9 w-9 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg border border-blue-500/20 glass-card shrink-0"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
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
                                                                <span className="font-mono text-xs text-emerald-400">${(item.price * item.quantity).toLocaleString()}</span>
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
                            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Past Orders History</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {pastOrders.slice(0, 15).map(order => (
                                    <div 
                                        key={order._id} 
                                        onClick={() => setSelectedOrder(order)}
                                        className="group flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.15)] relative overflow-hidden"
                                    >
                                        {/* Subtle Left Accent Highlight on Hover */}
                                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500/0 group-hover:bg-blue-500 transition-all duration-300" />
                                        
                                        <div className="flex items-center gap-4 pl-1">
                                            <div className="h-9 w-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all duration-300">
                                                <ShoppingCart className="w-4 h-4 text-muted-foreground group-hover:text-blue-400 transition-all duration-300" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-white group-hover:text-blue-400 transition-all duration-300">{order.requestedByName}</p>
                                                <p className="text-[11px] text-muted-foreground font-mono mt-0.5">Order #{order._id?.slice(-8)} • {new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-end gap-1">
                                                <Badge className={`${STATUS_COLORS[order.status] || ''} border text-[10px] py-0 px-2`}>{order.status}</Badge>
                                                <span className="font-mono text-sm font-bold text-slate-300">${order.grandTotal?.toLocaleString()}</span>
                                            </div>
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className="text-xs h-8 w-8 p-0 text-muted-foreground group-hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-300"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                        <div className="space-y-6">
                            {/* Stats Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-white/10 glass-card transition-all duration-300 hover:border-emerald-500/30">
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Total Invoiced</p>
                                            <h3 className="text-2xl font-black text-white font-mono">${totalBillsSum.toLocaleString()}</h3>
                                            <p className="text-[10px] text-muted-foreground">{totalBillsCount} total bills sent</p>
                                        </div>
                                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                                            <Receipt className="w-6 h-6" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent border-white/10 glass-card transition-all duration-300 hover:border-green-500/30">
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-green-400 uppercase tracking-wider">Paid Amount</p>
                                            <h3 className="text-2xl font-black text-white font-mono">${paidBillsSum.toLocaleString()}</h3>
                                            <p className="text-[10px] text-muted-foreground">{paidBillsCount} bills paid</p>
                                        </div>
                                        <div className="p-3 bg-green-500/10 text-green-400 rounded-xl">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent border-white/10 glass-card transition-all duration-300 hover:border-yellow-500/30">
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Pending Amount</p>
                                            <h3 className="text-2xl font-black text-white font-mono">${unpaidBillsSum.toLocaleString()}</h3>
                                            <p className="text-[10px] text-muted-foreground">{unpaidBillsCount} bills pending payment</p>
                                        </div>
                                        <div className={`p-3 bg-yellow-500/10 text-yellow-400 rounded-xl ${unpaidBillsCount > 0 ? 'animate-pulse' : ''}`}>
                                            <Clock className="w-6 h-6" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Controls Row */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white/5 p-4 rounded-xl border border-white/10">
                                <div className="flex gap-2">
                                    {(['All', 'Paid', 'Unpaid'] as const).map((status) => {
                                        const isActive = billStatusFilter === status;
                                        return (
                                            <Button
                                                key={status}
                                                variant={isActive ? 'default' : 'ghost'}
                                                size="sm"
                                                onClick={() => setBillStatusFilter(status)}
                                                className={`transition-all duration-200 ${
                                                    isActive
                                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'
                                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                                }`}
                                            >
                                                {status}
                                                <Badge
                                                    className={`ml-2 px-1.5 py-0.5 text-[9px] ${
                                                        isActive
                                                            ? 'bg-emerald-800 text-white font-black'
                                                            : 'bg-white/10 text-zinc-400 font-medium'
                                                    }`}
                                                >
                                                    {status === 'All'
                                                        ? totalBillsCount
                                                        : status === 'Paid'
                                                        ? paidBillsCount
                                                        : unpaidBillsCount}
                                                </Badge>
                                            </Button>
                                        );
                                    })}
                                </div>
                                <div className="relative flex-1 max-w-xs">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by ID, order reference, user..."
                                        value={billSearchTerm}
                                        onChange={(e) => setBillSearchTerm(e.target.value)}
                                        className="pl-9 bg-black/40 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500/50"
                                    />
                                </div>
                            </div>

                            {/* Bills Grid */}
                            {filteredBills.length === 0 ? (
                                <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-white/5 rounded-xl">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>No bills found matching the selected filters.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredBills.map((bill: any) => (
                                        <Card
                                            key={bill._id}
                                            className="bg-white/5 border-white/10 hover:bg-white/8 transition-all duration-300 hover:border-emerald-500/30 group"
                                        >
                                            <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="font-mono text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                                                #{bill._id.slice(-8)}
                                                            </span>
                                                            <Badge
                                                                variant="outline"
                                                                className={
                                                                    bill.status === 'Paid'
                                                                        ? 'bg-green-500/10 text-green-400 border-green-500/30 font-semibold'
                                                                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 font-semibold animate-pulse'
                                                                }
                                                            >
                                                                {bill.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2">
                                                            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                                                            <span>{new Date(bill.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                            <span className="text-zinc-600 font-bold">•</span>
                                                            <span>{new Date(bill.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Total Amount</p>
                                                        <p className="text-lg font-black text-white mt-0.5">${bill.totalPrice.toLocaleString()}</p>
                                                    </div>
                                                </div>

                                                <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <p className="text-[9px] uppercase tracking-wider text-zinc-500">Creator</p>
                                                        <p className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                                                            <User className="w-3.5 h-3.5 text-emerald-400/70" />
                                                            {bill.sentBy}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setSelectedBill(bill)}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1 text-xs shadow-md transition-all active:scale-[0.98]"
                                                    >
                                                        <FileText className="w-3.5 h-3.5" />
                                                        View Receipt
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
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

            {/* Bill Details Sheet Drawer */}
            <Sheet open={!!selectedBill} onOpenChange={(open) => { if (!open) setSelectedBill(null); }}>
                <SheetContent 
                    side="right" 
                    className="w-full sm:max-w-[480px] bg-black/95 backdrop-blur-3xl border-l border-white/10 text-white shadow-2xl p-6 overflow-y-auto before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-gradient-to-b before:from-emerald-500 before:via-teal-500 before:to-emerald-600"
                >
                    <SheetHeader className="pt-2">
                        <SheetTitle className="flex items-center gap-2 text-xl font-black text-white tracking-wide">
                            <Receipt className="w-5 h-5 text-emerald-400" />
                            Bill Receipt
                        </SheetTitle>
                        <SheetDescription className="text-zinc-400 font-mono text-[10px] mt-1 flex flex-wrap gap-x-2 gap-y-1">
                            <span>ID: #{selectedBill?._id}</span>
                            <span className="text-zinc-600">•</span>
                            <span>Created by: {selectedBill?.sentBy}</span>
                        </SheetDescription>
                    </SheetHeader>
                    
                    <div className="space-y-6 py-6">
                        {/* Status Ribbon & Total */}
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm relative overflow-hidden">
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Payment Status</p>
                                <Badge 
                                    variant="outline" 
                                    className={`mt-1.5 px-2.5 py-0.5 text-xs font-black ${
                                        selectedBill?.status === 'Paid' 
                                            ? 'bg-green-500/15 text-green-400 border-green-500/30' 
                                            : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30 animate-pulse'
                                    }`}
                                >
                                    {selectedBill?.status}
                                </Badge>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Total Payable</p>
                                <div className="flex items-center gap-2 justify-end mt-1">
                                    <p className="text-2xl font-black text-emerald-400 font-mono">${selectedBill?.totalPrice.toLocaleString()}</p>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 hover:bg-white/10 text-zinc-400 hover:text-white"
                                        onClick={() => {
                                            navigator.clipboard.writeText(selectedBill?.totalPrice.toString() || '');
                                            toast({ title: 'Copied!', description: 'Total price copied to clipboard.', className: 'bg-emerald-600 border-none' });
                                        }}
                                    >
                                        <DollarSign className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Order Reference */}
                        {selectedBill?.orderId && (
                            <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-xs flex justify-between items-center">
                                <span className="text-zinc-500 uppercase tracking-wider font-bold text-[10px]">Order Reference</span>
                                <span className="font-mono text-zinc-300 select-all">#{selectedBill.orderId}</span>
                            </div>
                        )}

                        {/* Billed Items Section */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="h-px flex-1 bg-white/10" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Billed Items</p>
                                <div className="h-px flex-1 bg-white/10" />
                            </div>
                            
                            <div className="rounded-xl border border-white/10 overflow-auto max-h-[300px] bg-black/40 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                                <table className="w-full min-w-[380px] text-xs">
                                    <thead className="bg-white/5 text-[9px] uppercase tracking-wider text-zinc-400 border-b border-white/10">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-bold">Item Name</th>
                                            <th className="px-4 py-2 text-center font-bold">Qty</th>
                                            <th className="px-4 py-2 text-right font-bold">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {selectedBill?.items.map((item: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 font-semibold text-zinc-200">{item.itemName}</td>
                                                <td className="px-4 py-3 text-center text-zinc-400 font-mono">x{item.quantity}</td>
                                                <td className="px-4 py-3 text-right font-mono text-white">${(item.price * item.quantity).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-white/5 font-bold border-t border-white/10">
                                        <tr>
                                            <td colSpan={2} className="px-4 py-3 text-emerald-400 tracking-wider">GRAND TOTAL</td>
                                            <td className="px-4 py-3 text-right font-mono text-emerald-400 text-sm">${selectedBill?.totalPrice.toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Settlement Bank Details */}
                        <div className="bg-gradient-to-br from-emerald-500/10 to-transparent p-4 rounded-xl border border-emerald-500/20 shadow-lg relative overflow-hidden group">
                            <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-black mb-2">Settlement Account (Vendor)</p>
                            <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5">
                                <span className="text-lg font-mono font-black text-white select-all tracking-wider">{selectedBill?.bankAccount}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-emerald-500/20 text-emerald-400"
                                    onClick={() => {
                                        navigator.clipboard.writeText(selectedBill?.bankAccount || '');
                                        toast({ title: 'Copied!', description: 'Bank account number copied.', className: 'bg-emerald-600 border-none' });
                                    }}
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-[9px] text-emerald-400/50 mt-2 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" /> Transfer exact invoice sum to settle this bill.
                            </p>
                        </div>
                    </div>

                    <SheetFooter className="mt-2">
                        <Button 
                            onClick={() => setSelectedBill(null)} 
                            className="w-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 font-bold transition-all"
                        >
                            Close Receipt
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Elegant Slide-Over Drawer for Order Details */}
            <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <SheetContent 
                    side="right" 
                    className="w-full sm:max-w-[480px] bg-black/95 backdrop-blur-3xl text-white border-l border-white/10 shadow-2xl p-6 overflow-y-auto before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-gradient-to-b before:from-blue-500 before:via-indigo-500 before:to-violet-600"
                >
                    <SheetHeader className="space-y-1 pb-4 border-b border-white/10">
                        <div className="flex items-center gap-2 text-blue-400">
                            <ShoppingCart className="w-5 h-5" />
                            <SheetTitle className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">
                                Order Details
                            </SheetTitle>
                        </div>
                        <SheetDescription className="text-zinc-500 text-xs">
                            Full summary and status of raw material request.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-6 space-y-6">
                        {/* Order Header / Metadata */}
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm relative overflow-hidden">
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Order ID</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="font-mono text-sm text-zinc-300 font-bold select-all">
                                        #{selectedOrder?._id?.slice(-8)}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 hover:bg-white/10 text-zinc-400 hover:text-white"
                                        onClick={() => {
                                            navigator.clipboard.writeText(selectedOrder?._id || '');
                                            toast({ title: 'Copied!', description: 'Full Order ID copied.', className: 'bg-emerald-600 border-none' });
                                        }}
                                    >
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Requested By</p>
                                <p className="text-sm font-bold text-white mt-1">{selectedOrder?.requestedByName}</p>
                            </div>
                        </div>

                        {/* Order Status Timeline Banner */}
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Delivery Status</p>
                                <Badge 
                                    className={`mt-1.5 px-2.5 py-0.5 text-xs font-black ${STATUS_COLORS[selectedOrder?.status] || 'border'}`}
                                >
                                    {selectedOrder?.status}
                                </Badge>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Date Requested</p>
                                <p className="text-xs font-semibold text-zinc-300 mt-1">
                                    {selectedOrder?.createdAt && new Date(selectedOrder.createdAt).toLocaleString('en-GB')}
                                </p>
                            </div>
                        </div>

                        {/* Items Requested List */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="h-px flex-1 bg-white/10" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Items Requested</p>
                                <div className="h-px flex-1 bg-white/10" />
                            </div>
                            
                            <div className="rounded-xl border border-white/10 overflow-auto max-h-[300px] bg-black/40 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                                <table className="w-full min-w-[440px] text-xs">
                                    <thead className="bg-white/5 text-[9px] uppercase tracking-wider text-zinc-400 border-b border-white/10">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-bold">Material</th>
                                            <th className="px-4 py-2 text-center font-bold">Qty</th>
                                            <th className="px-4 py-2 text-right font-bold">Unit Price</th>
                                            <th className="px-4 py-2 text-right font-bold">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {selectedOrder?.items?.map((item: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 font-semibold text-zinc-200">{item.itemName}</td>
                                                <td className="px-4 py-3 text-center text-zinc-400 font-mono">x{item.quantity}</td>
                                                <td className="px-4 py-3 text-right text-zinc-400 font-mono">${item.price?.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-right font-mono text-white">${(item.price * item.quantity).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-white/5 font-bold border-t border-white/10">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3 text-blue-400 tracking-wider">GRAND TOTAL</td>
                                            <td className="px-4 py-3 text-right font-mono text-blue-400 text-sm">${selectedOrder?.grandTotal?.toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Extra Order Notes */}
                        {selectedOrder?.notes && (
                            <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/20">
                                <p className="text-[10px] text-blue-400 uppercase tracking-widest font-black mb-1">Order Notes</p>
                                <p className="text-xs text-zinc-300 italic">{selectedOrder.notes}</p>
                            </div>
                        )}

                        {/* Bill Settlement Link Info */}
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                            <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Billing Status</span>
                            <Badge 
                                variant="outline"
                                className={`text-[10px] py-0 px-2 font-bold ${
                                    selectedOrder?.billSent 
                                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                }`}
                            >
                                {selectedOrder?.billSent ? 'Bill Invoiced & Sent' : 'Unbilled / Pending Delivery'}
                            </Badge>
                        </div>
                    </div>

                    <SheetFooter className="mt-2">
                        <Button 
                            onClick={() => setSelectedOrder(null)} 
                            className="w-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 font-bold transition-all"
                        >
                            Close Details
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}

