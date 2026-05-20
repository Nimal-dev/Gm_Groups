'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package, Clock, X, RefreshCw, ChevronRight, User, AlertCircle, Calendar, Info } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

const STATUS_COLORS: Record<string, string> = {
    'Pending': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    'Order Confirmed': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    'Packing': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    'Out for Delivery': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    'Delivered': 'bg-green-500/10 text-green-400 border-green-500/30',
    'Payment Complete': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    'Cancelled': 'bg-red-500/10 text-red-400 border-red-500/30',
};

interface RawMaterialStatusesTabProps {
    userId: string;
    userName: string;
    userRole?: string;
}

export default function RawMaterialStatusesTab({ userId, userName, userRole }: RawMaterialStatusesTabProps) {
    const { toast } = useToast();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelModal, setCancelModal] = useState<any>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    // No filtering - fetching all orders globally as requested

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const mod = await import('@/actions/vendor');
            // Irrespective of roles, fetch all requests made to YKZ/MLB or both by omitting userRole parameter
            const res = await mod.getEmployeeOrders(userId, userName);
            if (res.success) {
                setOrders(res.orders);
                // Keep the selected order details in sync if it's currently open
                if (selectedOrder) {
                    const updated = res.orders.find((o: any) => o._id === selectedOrder._id);
                    if (updated) setSelectedOrder(updated);
                }
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { 
        fetchOrders(); 
        const interval = setInterval(() => {
            if (!document.hidden) fetchOrders();
        }, 30000); // Auto-refresh every 30 seconds
        return () => clearInterval(interval);
    }, [userId, userName, userRole]);

    const handleCancel = async () => {
        if (!cancelReason.trim()) {
            toast({ title: 'Error', description: 'Provide a reason.', variant: 'destructive' });
            return;
        }
        setCancelling(true);
        try {
            const mod = await import('@/actions/vendor');
            const res = await mod.cancelOrder(cancelModal._id, cancelReason, userName);
            if (res.success) {
                toast({ title: 'Order Cancelled', className: 'bg-red-600 border-none' });
                fetchOrders();
            } else throw new Error(res.error);
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
        setCancelModal(null);
        setCancelReason('');
        setCancelling(false);
    };

    const activeOrders = orders.filter(o => !['Cancelled', 'Payment Complete'].includes(o.status));
    const pastOrders = orders.filter(o => ['Cancelled', 'Payment Complete'].includes(o.status));

    if (loading) {
        return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Package className="w-5 h-5 text-accent" /> Raw Material Orders Status</h2>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={fetchOrders} className="text-muted-foreground"><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
                </div>
            </div>

            {/* Debug Info (Visible only in console for now) */}
            {/* ... */}

            {/* Active Orders */}
            {activeOrders.length === 0 && pastOrders.length === 0 ? (
                <Card className="glass-card"><CardContent className="py-16 text-center text-muted-foreground"><Package className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No orders placed yet.</p></CardContent></Card>
            ) : (
                <>
                    {activeOrders.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active ({activeOrders.length})</p>
                            {activeOrders.map(order => (
                                <Card key={order._id} className="glass-card border-l-4 border-l-accent hover:border-l-accent/80 transition-all duration-300">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex flex-col md:flex-row justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={`${STATUS_COLORS[order.status] || ''} border text-xs`}>{order.status}</Badge>
                                                    <Badge variant="outline" className="text-xs border-white/10 bg-white/5 text-white">{order.vendorRole} Vendor</Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 font-mono">#{order._id?.slice(-8)} • {new Date(order.createdAt).toLocaleString('en-GB')}</p>
                                            </div>
                                            <p className="text-lg font-bold font-mono text-accent">${order.grandTotal?.toLocaleString()}</p>
                                        </div>

                                        <div className="bg-black/20 rounded-lg p-3">
                                            <div className="space-y-1">
                                                {order.items?.map((item: any, i: number) => (
                                                    <div key={i} className="flex justify-between text-sm">
                                                        <span className="text-white/80">{item.quantity}x {item.itemName}</span>
                                                        <span className="font-mono text-white/60">${(item.price * item.quantity).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {order.notes && <p className="text-xs italic text-muted-foreground">Note: {order.notes}</p>}

                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)} className="text-xs h-8 text-white border-white/10 bg-white/5 hover:bg-white/10">
                                                <Info className="w-3 h-3 mr-1" /> View Details
                                            </Button>
                                            {!['Delivered', 'Payment Complete', 'Cancelled'].includes(order.status) && (
                                                <Button size="sm" variant="destructive" onClick={() => setCancelModal(order)} className="text-xs h-8">
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
                        <div className="space-y-3 mt-6">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-2"><Clock className="w-3 h-3" /> History ({pastOrders.length})</p>
                            {pastOrders.slice(0, 15).map(order => (
                                <div 
                                    key={order._id} 
                                    onClick={() => setSelectedOrder(order)}
                                    className="flex flex-col md:flex-row justify-between items-start md:items-center p-3 rounded-lg bg-white/5 border border-white/5 opacity-70 hover:opacity-100 cursor-pointer hover:bg-white/10 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-3">
                                        <Badge className={`${STATUS_COLORS[order.status] || ''} border text-[10px]`}>{order.status}</Badge>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-white/90">{order.vendorRole} Vendor</p>
                                                <Badge variant="outline" className="text-[9px] border-white/10 text-zinc-400 py-0 px-1 font-mono">#{order._id?.slice(-8)}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-GB')} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 md:mt-0">
                                        <div className="text-right">
                                            <span className="font-mono text-sm font-semibold text-white">${order.grandTotal?.toLocaleString()}</span>
                                            {order.cancelReason && <p className="text-[10px] text-red-400 italic mt-0.5">Cancelled: {order.cancelReason}</p>}
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-zinc-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Cancel Dialog */}
            <Dialog open={!!cancelModal} onOpenChange={(open) => { if (!open) { setCancelModal(null); setCancelReason(''); } }}>
                <DialogContent className="sm:max-w-[400px] bg-black/80 backdrop-blur-2xl border-white/10 text-white">
                    <DialogHeader><DialogTitle className="text-red-400">Cancel Order</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-4">
                        <p className="text-sm text-muted-foreground">Order #{cancelModal?._id?.slice(-8)} to <strong className="text-white">{cancelModal?.vendorRole}</strong></p>
                        <Label className="text-xs text-zinc-400 uppercase">Reason</Label>
                        <Textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                            className="bg-white/5 border-white/10 text-white" placeholder="Why are you cancelling?" />
                    </div>
                    <DialogFooter>
                        <Button variant="destructive" onClick={handleCancel} disabled={cancelling} className="w-full">
                            {cancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />}
                            Confirm Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Order Details Drawer */}
            <Sheet open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}>
                <SheetContent className="w-full sm:max-w-[480px] bg-black/95 border-l border-white/10 text-white p-6 overflow-y-auto backdrop-blur-2xl">
                    <SheetHeader className="border-b border-white/10 pb-4 mb-4">
                        <div className="flex items-center justify-between">
                            <Badge className={`px-2 py-0.5 text-xs ${STATUS_COLORS[selectedOrder?.status] || ''} border`}>
                                {selectedOrder?.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-white/20 text-white bg-white/5 px-2 py-0.5">
                                {selectedOrder?.vendorRole} Vendor
                            </Badge>
                        </div>
                        <SheetTitle className="text-xl font-bold flex items-center gap-2 text-white font-sans mt-2">
                            <Package className="w-5 h-5 text-accent" />
                            Order Details
                        </SheetTitle>
                        <SheetDescription className="text-xs text-zinc-400 font-mono">
                            #{selectedOrder?._id}
                        </SheetDescription>
                    </SheetHeader>

                    {selectedOrder && (
                        <div className="space-y-6">
                            {/* Key Info Cards */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex flex-col justify-between">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                                        <User className="w-3 h-3 text-accent" /> Requested By
                                    </span>
                                    <span className="text-sm font-semibold text-white mt-1 truncate">
                                        {selectedOrder.requestedByName || 'Staff Member'}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 font-mono truncate">
                                        @{selectedOrder.requestedBy || 'N/A'}
                                    </span>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex flex-col justify-between">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-accent" /> Ordered Date
                                    </span>
                                    <span className="text-sm font-semibold text-white mt-1">
                                        {new Date(selectedOrder.createdAt).toLocaleDateString('en-GB')}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 font-mono">
                                        {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            {/* Cancellation Context */}
                            {selectedOrder.status === 'Cancelled' && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-2">
                                    <div className="flex items-center gap-2 text-red-400 text-xs font-semibold">
                                        <AlertCircle className="w-4 h-4" />
                                        CANCELLED ORDER
                                    </div>
                                    <p className="text-sm text-red-200/90 italic">
                                        "{selectedOrder.cancelReason || 'No reason provided.'}"
                                    </p>
                                    {selectedOrder.cancelledBy && (
                                        <p className="text-[10px] text-red-400/70">
                                            Cancelled by: <strong className="text-red-400 font-semibold">{selectedOrder.cancelledBy}</strong>
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Sourcing Itemization */}
                            <div className="space-y-3">
                                <h3 className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Requested Materials</h3>
                                <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/5 text-[10px] text-zinc-400 bg-white/5">
                                                    <th className="p-3">Material Name</th>
                                                    <th className="p-3 text-right">Qty</th>
                                                    <th className="p-3 text-right">Rate</th>
                                                    <th className="p-3 text-right">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5 text-sm">
                                                {selectedOrder.items?.map((item: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                        <td className="p-3 text-white/95 font-medium">{item.itemName}</td>
                                                        <td className="p-3 text-right text-zinc-300 font-mono">{item.quantity}</td>
                                                        <td className="p-3 text-right text-zinc-300 font-mono">${(item.price || 0).toLocaleString()}</td>
                                                        <td className="p-3 text-right text-white font-mono font-semibold">${((item.price || 0) * item.quantity).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="bg-white/5 p-4 flex justify-between items-center border-t border-white/5">
                                        <span className="text-sm font-semibold text-zinc-300">Grand Total</span>
                                        <span className="text-xl font-bold font-mono text-accent">
                                            ${(selectedOrder.grandTotal || 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Metadata */}
                            {selectedOrder.notes && (
                                <div className="space-y-2">
                                    <h4 className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Additional Notes</h4>
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-sm text-zinc-300 italic">
                                        {selectedOrder.notes}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons if order is not completed/cancelled */}
                            {!['Delivered', 'Payment Complete', 'Cancelled'].includes(selectedOrder.status) && (
                                <Button 
                                    variant="destructive" 
                                    onClick={() => {
                                        setCancelModal(selectedOrder);
                                        setSelectedOrder(null);
                                    }}
                                    className="w-full h-10 mt-4 rounded-xl text-xs"
                                >
                                    <X className="w-4 h-4 mr-2" /> Cancel Order
                                </Button>
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
