'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package, Clock, X, RefreshCw } from 'lucide-react';

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

    // No filtering - fetching all orders globally as requested

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const mod = await import('@/actions/vendor');
            const res = await mod.getEmployeeOrders(userId, userName, userRole);
            if (res.success) setOrders(res.orders);
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
                                <Card key={order._id} className="glass-card border-l-4 border-l-accent">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex flex-col md:flex-row justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={`${STATUS_COLORS[order.status] || ''} border`}>{order.status}</Badge>
                                                    <Badge variant="outline" className="text-xs">{order.vendorRole}</Badge>
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

                                        {!['Delivered', 'Payment Complete', 'Cancelled'].includes(order.status) && (
                                            <Button size="sm" variant="destructive" onClick={() => setCancelModal(order)} className="text-xs h-8">
                                                <X className="w-3 h-3 mr-1" /> Cancel Order
                                            </Button>
                                        )}
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
                                <div key={order._id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-3 rounded-lg bg-white/5 border border-white/5 opacity-70 hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-3">
                                        <Badge className={`${STATUS_COLORS[order.status] || ''} border text-[10px]`}>{order.status}</Badge>
                                        <div>
                                            <p className="text-sm font-semibold">{order.vendorRole}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 md:mt-0">
                                        <span className="font-mono text-sm">${order.grandTotal?.toLocaleString()}</span>
                                        {order.cancelReason && <span className="text-[10px] text-red-400 italic">({order.cancelReason})</span>}
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
        </div>
    );
}
