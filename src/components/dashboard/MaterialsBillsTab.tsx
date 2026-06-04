'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Loader2, FileText, CheckCircle2, AlertCircle, ReceiptText, User, Hash, DollarSign, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAdminBills, updateBillStatus } from '@/actions/vendor';
import { motion, AnimatePresence } from 'framer-motion';

import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle, 
} from "@/components/ui/alert-dialog";

export default function MaterialsBillsTab() {
    const [bills, setBills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<any>({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const { toast } = useToast();

    const fetchBills = async (page: number = 1) => {
        setLoading(true);
        const res = await getAdminBills(page, 10);
        if (res.success) {
            setBills(res.bills);
            if (res.pagination) {
                setPagination(res.pagination);
            }
            setCurrentPage(page);
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBills(1);
    }, []);

    const handleMarkAsPaid = async (billId: string) => {
        setActionLoading(billId);
        const res = await updateBillStatus(billId, 'Paid');
        if (res.success) {
            toast({ 
                title: 'Payment Confirmed', 
                description: 'Bill marked as paid and status updated.',
                className: 'bg-green-600 border-none'
            });
            fetchBills(currentPage);
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' });
        }
        setActionLoading(null);
    };

    if (loading && bills.length === 0) {
        return (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                    <span>Loading Materials Bills...</span>
                </div>
            </div>
        );
    }

    return (
        <Card className="glass-card">
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <ReceiptText className="w-5 h-5 text-accent" /> Vendor Materials Bills
                        </CardTitle>
                        <CardDescription>Review and manage invoices sent by raw material vendors.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => fetchBills(currentPage)} disabled={loading} className="border-white/10 hover:bg-white/5">
                        <Loader2 className={`w-3 h-3 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col justify-between">
                {bills.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-white/5 rounded-xl">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No material bills received yet.</p>
                    </div>
                ) : (
                    <div className={`flex flex-col gap-4 transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                        {bills.map((bill) => (
                            <BillItem 
                                key={bill._id} 
                                bill={bill} 
                                onPaid={() => handleMarkAsPaid(bill._id)} 
                                loading={actionLoading === bill._id} 
                            />
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                        <div className="text-xs text-muted-foreground">
                            Page {currentPage} of {pagination.totalPages} | Total: {pagination.total} Bills
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchBills(currentPage - 1)}
                                disabled={currentPage <= 1 || loading}
                                className="h-8 w-8 p-0 border-white/10 hover:bg-white/5 disabled:opacity-30"
                            >
                                &lt;
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchBills(currentPage + 1)}
                                disabled={currentPage >= pagination.totalPages || loading}
                                className="h-8 w-8 p-0 border-white/10 hover:bg-white/5 disabled:opacity-30"
                            >
                                &gt;
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function BillItem({ bill, onPaid, loading }: { bill: any, onPaid: () => void, loading: boolean }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { toast } = useToast();

    return (
        <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'bg-white/10 border-accent/30 shadow-2xl shadow-accent/5' : 'bg-white/5 border-white/10 hover:bg-white/8'}`}>
            {/* Header / Clickable Area */}
            <div 
                className="p-4 cursor-pointer group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${bill.status === 'Paid' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400 animate-pulse'}`}>
                            <ReceiptText className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-lg flex items-center gap-2">
                                    <Building2 className={`w-4 h-4 ${bill.vendorRole === 'MLB' ? 'text-blue-400' : 'text-red-400'}`} />
                                    {bill.vendorRole} Vendor
                                </h4>
                                <Badge variant="outline" className={`
                                    ${bill.status === 'Paid' ? 'text-green-400 border-green-500/50 bg-green-500/10' : 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10'}
                                `}>
                                    {bill.status}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Hash className="w-3 h-3 text-accent/50" /> Order: {bill.orderId}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                                    {new Date(bill.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Price</p>
                            <p className="text-xl font-bold text-white">${bill.totalPrice.toLocaleString()}</p>
                        </div>
                        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-accent' : 'text-white/20'}`}>
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <div className="px-4 pb-6 space-y-6 border-t border-white/5 pt-6 bg-black/20">
                            {/* Detailed Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Vendor Role</p>
                                    <p className="font-bold flex items-center gap-2">
                                        <Building2 className={`w-4 h-4 ${bill.vendorRole === 'MLB' ? 'text-blue-400' : 'text-red-400'}`} /> {bill.vendorRole}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Sent By</p>
                                    <p className="font-medium flex items-center gap-2 truncate">
                                        <User className="w-4 h-4 text-accent" /> {bill.sentBy}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Full Order ID</p>
                                    <p className="font-mono text-xs text-white/70">{bill.orderId}</p>
                                </div>
                                <div className="space-y-1 sm:text-right">
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Exact Timestamp</p>
                                    <p className="text-[10px] text-white/50">{new Date(bill.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-px flex-1 bg-white/10" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Items Summary</p>
                                    <div className="h-px flex-1 bg-white/10" />
                                </div>
                                <div className="rounded-xl border border-white/5 overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-white/5 text-muted-foreground text-[10px] uppercase">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Item</th>
                                                <th className="px-4 py-2 text-center">Qty</th>
                                                <th className="px-4 py-2 text-right">Price</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {bill.items.map((item: any, i: number) => (
                                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-4 py-3">{item.itemName}</td>
                                                    <td className="px-4 py-3 text-center text-muted-foreground">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-right font-mono">${item.price.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-accent/5 border-t border-accent/20">
                                            <tr>
                                                <td colSpan={2} className="px-4 py-3 font-bold text-accent">GRAND TOTAL</td>
                                                <td className="px-4 py-3 text-right font-bold text-accent text-lg">${bill.totalPrice.toLocaleString()}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Settlement Info (Vendor Account and Amount Closeby) */}
                            <div className="bg-gradient-to-br from-accent/20 via-accent/5 to-black/40 p-5 rounded-2xl border border-accent/20 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                    <Building2 className="w-24 h-24 text-accent" />
                                </div>
                                
                                <div className="flex flex-col gap-6 relative z-10">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] uppercase text-accent font-bold tracking-widest mb-2">Settlement Account (Vendor)</p>
                                            <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5 w-fit">
                                                <p className="text-xl sm:text-2xl font-mono tracking-wider font-black text-white select-all">{bill.bankAccount}</p>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 hover:bg-accent/20 text-accent"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigator.clipboard.writeText(bill.bankAccount);
                                                        toast({ title: 'Copied!', description: 'Account number copied to clipboard.', className: 'bg-accent text-black border-none' });
                                                    }}
                                                >
                                                    <Hash className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] text-accent font-bold">
                                                ID: {bill.orderId.slice(-6)}
                                            </div>
                                            <p className="text-[10px] text-accent/50 italic flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> Transfer exact amount to avoid delays
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-black/60 p-5 rounded-2xl border border-accent/10 backdrop-blur-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Payable Amount</p>
                                            <div className="flex items-center gap-3">
                                                <p className="text-3xl sm:text-4xl font-black text-accent drop-shadow-[0_0_15px_rgba(255,191,0,0.4)]">
                                                    ${bill.totalPrice.toLocaleString()}
                                                </p>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-10 w-10 hover:bg-accent/20 text-accent bg-accent/5"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigator.clipboard.writeText(bill.totalPrice.toString());
                                                        toast({ title: 'Copied!', description: 'Amount copied to clipboard.', className: 'bg-accent text-black border-none' });
                                                    }}
                                                >
                                                    <DollarSign className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="hidden sm:block p-3 rounded-2xl bg-accent/10 border border-accent/20">
                                            <CheckCircle2 className="w-8 h-8 text-accent opacity-50" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            {bill.status === 'Unpaid' && (
                                <div className="flex justify-end pt-4">
                                    <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                                        <Button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowConfirm(true);
                                            }} 
                                            disabled={loading}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-[0_0_30px_rgba(34,197,94,0.4)] border-t border-white/20 py-8 h-auto text-lg sm:text-xl font-black flex flex-col sm:flex-row gap-2 transition-all active:scale-[0.98]"
                                        >
                                            <div className="flex items-center gap-2">
                                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />} 
                                                <span>Confirm Payment</span>
                                            </div>
                                            <span className="text-xs sm:text-sm opacity-70 font-medium">(Mark as Paid)</span>
                                        </Button>

                                        <AlertDialogContent className="bg-zinc-900 border-white/10 text-white shadow-2xl backdrop-blur-xl">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="text-xl flex items-center gap-2">
                                                    <CheckCircle2 className="w-6 h-6 text-green-500" /> Confirm Payment?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription className="text-zinc-400">
                                                    Are you sure you want to mark this bill from <strong className="text-white">{bill.vendorRole} Vendor</strong> as <strong className="text-green-400">PAID</strong>? 
                                                    This action will update the system and cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter className="mt-6 flex gap-2">
                                                <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 text-white transition-colors flex-1">
                                                    Not Yet
                                                </AlertDialogCancel>
                                                <AlertDialogAction 
                                                    onClick={onPaid}
                                                    className="bg-green-600 hover:bg-green-700 text-white border-none shadow-[0_0_20px_rgba(34,197,94,0.3)] flex-1"
                                                >
                                                    Yes, Mark as Paid
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


