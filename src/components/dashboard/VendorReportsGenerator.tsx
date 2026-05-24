'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2, Calendar, FileText, Copy, Check, ShoppingBag, CheckCircle, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getLocalPeriodRange, formatLocalDate } from '@/lib/date-utils';
import { getVendorReportData } from '@/actions/vendor';

interface VendorReportsGeneratorProps {
    vendorRole: string;
}

export default function VendorReportsGenerator({ vendorRole }: VendorReportsGeneratorProps) {
    const { toast } = useToast();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!startDate || !endDate) {
            toast({ title: 'Error', description: 'Please select both start and end dates.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const { start, end } = getLocalPeriodRange(startDate, endDate);
            const res = await getVendorReportData(vendorRole, start.toISOString(), end.toISOString());
            
            if (res.success) {
                setReportData(res.data);
                toast({ title: 'Report Generated', className: 'bg-green-600 border-none' });
            } else {
                throw new Error(res.error);
            }
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!reportData) return;

        const reportText = `
📦 ${vendorRole} VENDOR WEEKLY REPORT
📅 Period: ${formatLocalDate(reportData.startDate)} - ${formatLocalDate(reportData.endDate)}

--- RAW MATERIAL CONSUMPTION ---
${reportData.items.map((item: any) => `- ${item.name}: ${item.quantity} ${item.unit} (Price: $${item.unitPrice.toLocaleString()} | Total: $${item.totalPrice.toLocaleString()})`).join('\n')}

--- SUMMARY ---
💰 Grand Total Amount: $${reportData.grandTotalAmount.toLocaleString()}
🔢 Total Quantity Ordered: ${reportData.grandTotalQuantity.toLocaleString()} items
📦 Total Orders Placed: ${reportData.totalOrders}
✅ Successfully Completed: ${reportData.completedOrders}

Generated via GM Dashboard
        `.trim();

        navigator.clipboard.writeText(reportText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({ title: 'Copied to Clipboard', className: 'bg-blue-600 border-none' });
    };

    return (
        <div className="space-y-6">
            <Card className="glass-card border-emerald-500/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-400" />
                        Generate Raw Material Report
                    </CardTitle>
                    <CardDescription>
                        Generate a detailed report of all raw material orders for a specific period.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase">Start Date</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                                <Input 
                                    type="date" 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="pl-10 bg-black/40 border-white/10 text-white focus:ring-emerald-500/50"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase">End Date</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                                <Input 
                                    type="date" 
                                    value={endDate} 
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="pl-10 bg-black/40 border-white/10 text-white focus:ring-emerald-500/50"
                                />
                            </div>
                        </div>
                        <Button 
                            onClick={handleGenerate} 
                            disabled={loading}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <TrendingUp className="w-4 h-4 mr-2" />}
                            Generate Report
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {reportData && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Quick Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="glass-card bg-emerald-500/5 border-emerald-500/20">
                            <CardContent className="p-4">
                                <p className="text-xs text-emerald-400 uppercase tracking-wider font-semibold">Grand Total</p>
                                <p className="text-2xl font-bold text-white mt-1">${reportData.grandTotalAmount.toLocaleString()}</p>
                            </CardContent>
                        </Card>
                        <Card className="glass-card bg-blue-500/5 border-blue-500/20">
                            <CardContent className="p-4">
                                <p className="text-xs text-blue-400 uppercase tracking-wider font-semibold">Total Quantity</p>
                                <p className="text-2xl font-bold text-white mt-1">${reportData.grandTotalQuantity.toLocaleString()}</p>
                            </CardContent>
                        </Card>
                        <Card className="glass-card bg-purple-500/5 border-purple-500/20">
                            <CardContent className="p-4">
                                <p className="text-xs text-purple-400 uppercase tracking-wider font-semibold">Total Orders</p>
                                <p className="text-2xl font-bold text-white mt-1">${reportData.totalOrders}</p>
                            </CardContent>
                        </Card>
                        <Card className="glass-card bg-orange-500/5 border-orange-500/20">
                            <CardContent className="p-4">
                                <p className="text-xs text-orange-400 uppercase tracking-wider font-semibold">Completed</p>
                                <div className="flex items-end gap-2">
                                    <p className="text-2xl font-bold text-white mt-1">${reportData.completedOrders}</p>
                                    <span className="text-xs text-muted-foreground mb-1">/ ${reportData.totalOrders}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Breakdown */}
                    <Card className="glass-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-lg">Raw Material Consumption</CardTitle>
                                <CardDescription>Summary of each item purchased</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={copyToClipboard} className="border-white/10 hover:bg-white/5">
                                {copied ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <Copy className="w-4 h-4 mr-2" />}
                                Copy Text Report
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border border-white/5 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-white/5">
                                        <TableRow className="border-white/5">
                                            <TableHead>Raw Material</TableHead>
                                            <TableHead className="text-center">Quantity</TableHead>
                                            <TableHead className="text-right">Avg. Unit Price</TableHead>
                                            <TableHead className="text-right">Total Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.items.map((item: any, i: number) => (
                                            <TableRow key={i} className="border-white/5 hover:bg-white/5">
                                                <TableCell className="font-medium text-white">{item.name}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className="bg-white/5 border-white/10 font-mono">
                                                        {item.quantity} {item.unit}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-emerald-400">
                                                    ${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell className="text-right font-mono font-bold text-white">
                                                    ${item.totalPrice.toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {reportData.items.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                    No orders found in this period.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
