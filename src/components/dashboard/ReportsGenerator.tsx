'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, FileText, Loader2, Copy, Send } from 'lucide-react';
import { generateReportData } from '@/actions/report';
import { sendReportToDiscord } from '@/actions/discord';
import { useToast } from '@/hooks/use-toast';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

export function ReportsGenerator({ userRole = 'staff' }: { userRole?: string }) {
    const { toast } = useToast();
    const isAdmin = userRole === 'admin';
    const [reportType, setReportType] = useState(isAdmin ? 'Weekly' : 'Invoice');

    // Report Metadata State (kept separate from RHF for simplicity as they are mixed fields)
    const [reportTo, setReportTo] = useState('High Command');
    const [reportFrom, setReportFrom] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const [sending, setSending] = useState(false);

    // Schema for Invoice Items
    const InvoiceItemSchema = z.object({
        description: z.string().min(1, "Description required"),
        quantity: z.number().min(1, "Qty must be >= 1"),
        price: z.number().min(0, "Price must be >= 0")
    });

    const InvoiceFormSchema = z.object({
        discount: z.string().regex(/^\d*\.?\d*$/, "Invalid discount (number only)"),
        items: z.array(InvoiceItemSchema)
    });

    type InvoiceFormValues = z.infer<typeof InvoiceFormSchema>;

    const invoiceForm = useForm<InvoiceFormValues>({
        resolver: zodResolver(InvoiceFormSchema),
        defaultValues: {
            discount: '',
            items: []
        }
    });

    // Report Dates Schema
    const today = new Date().toISOString().split('T')[0];
    const DateRangeSchema = z.object({
        startDate: z.string().min(1, "Start Date required"),
        endDate: z.string().min(1, "End Date required"),
        membersRemoved: z.string().regex(/^\d*$/, "Numbers only").optional()
    });

    type DateRangeValues = z.infer<typeof DateRangeSchema>;

    const reportForm = useForm<DateRangeValues>({
        resolver: zodResolver(DateRangeSchema),
        defaultValues: {
            startDate: today,
            endDate: today,
            membersRemoved: ''
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: invoiceForm.control,
        name: "items"
    });

    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        setGeneratedText('');
        try {
            let reportText = '';

            if (reportType === 'Invoice') {
                const isValid = await invoiceForm.trigger();
                if (!isValid) {
                    throw new Error("Please correct invoice errors.");
                }
                const data = invoiceForm.getValues();
                reportText = formatInvoice(data.items, data.discount, reportTo, reportFrom);
            } else {
                const isValid = await reportForm.trigger();
                if (!isValid) {
                    throw new Error("Please correct date errors.");
                }
                const data = reportForm.getValues();

                const result = await generateReportData(new Date(data.startDate), new Date(data.endDate));
                if (!result.success || !result.data) {
                    throw new Error(result.error || 'Unknown error occurred');
                }

                reportText = formatReport(reportType, result.data, reportTo, reportFrom, data.membersRemoved || '0');
            }

            setGeneratedText(reportText);
            toast({
                title: "Report generated successfully!",
                description: "You can now copy the report below."
            });
        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Failed to generate",
                description: error.message || "Check inputs and try again."
            });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!generatedText) return;
        navigator.clipboard.writeText(generatedText);
        toast({ title: "Copied!", description: "Report copied to clipboard." });
    };

    const handleSendToDiscord = async () => {
        if (!generatedText) return;
        setSending(true);
        try {
            const result = await sendReportToDiscord(generatedText);
            if (result.success) {
                toast({ title: "Sent to Discord!", description: "Report sent to channel." });
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to send", description: error.message });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Control Panel */}
            <Card className="glass-card h-fit">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-accent" /> Generate {reportType === 'Invoice' ? 'Invoice' : 'Report'}
                    </CardTitle>
                    <CardDescription>Select report type and input details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={reportType} onValueChange={setReportType} disabled={!isAdmin}>
                            <SelectTrigger className="glass-input">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Weekly">Weekly Report</SelectItem>
                                <SelectItem value="Monthly">Monthly Report</SelectItem>
                                <SelectItem value="Invoice">Invoice</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {reportType !== 'Invoice' ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input
                                        type="date"
                                        {...reportForm.register('startDate')}
                                        className="glass-input block"
                                    />
                                    {reportForm.formState.errors.startDate && <span className="text-xs text-red-400">{reportForm.formState.errors.startDate.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input
                                        type="date"
                                        {...reportForm.register('endDate')}
                                        className="glass-input block"
                                    />
                                    {reportForm.formState.errors.endDate && <span className="text-xs text-red-400">{reportForm.formState.errors.endDate.message}</span>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Members Removed</Label>
                                <Input
                                    type="text"
                                    placeholder="0"
                                    {...reportForm.register('membersRemoved')}
                                    className="glass-input"
                                />
                                {reportForm.formState.errors.membersRemoved && <span className="text-xs text-red-400">{reportForm.formState.errors.membersRemoved.message}</span>}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 border-t border-white/10 pt-4">
                            <div className="flex justify-between items-center">
                                <Label>Invoice Items</Label>
                                <Button variant="outline" size="sm" onClick={() => append({ description: '', quantity: 1, price: 0 })} className="h-8 border-dashed">
                                    + Add Item
                                </Button>
                            </div>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-12 gap-2 items-center bg-black/20 p-2 rounded">
                                        <div className="col-span-6">
                                            <Input
                                                placeholder="Item Name"
                                                className="glass-input h-8 text-xs"
                                                {...invoiceForm.register(`items.${index}.description` as const)}
                                            />
                                            {invoiceForm.formState.errors.items?.[index]?.description && <span className="text-[10px] text-red-400 block">{invoiceForm.formState.errors.items[index]?.description?.message}</span>}
                                        </div>
                                        <div className="col-span-2">
                                            <Input
                                                type="number"
                                                placeholder="Qty"
                                                className="glass-input h-8 text-xs"
                                                {...invoiceForm.register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <Input
                                                type="number"
                                                placeholder="Price"
                                                className="glass-input h-8 text-xs"
                                                {...invoiceForm.register(`items.${index}.price` as const, { valueAsNumber: true })}
                                            />
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-300" onClick={() => remove(index)}>
                                                &times;
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {fields.length === 0 && (
                                    <p className="text-xs text-muted-foreground text-center py-4">No items added.</p>
                                )}
                                {invoiceForm.formState.errors.items && <p className="text-xs text-red-400 text-center">{invoiceForm.formState.errors.items.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Discount (%)</Label>
                                <Input
                                    type="text"
                                    placeholder="0"
                                    {...invoiceForm.register('discount')}
                                    className="glass-input"
                                />
                                {invoiceForm.formState.errors.discount && <span className="text-xs text-red-400">{invoiceForm.formState.errors.discount.message}</span>}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                        <div className="space-y-2">
                            <Label>From</Label>
                            <Input
                                placeholder="Manager Name"
                                value={reportFrom}
                                onChange={(e) => setReportFrom(e.target.value)}
                                className="glass-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>To</Label>
                            <Input
                                placeholder="Customer / Recipient"
                                value={reportTo}
                                onChange={(e) => setReportTo(e.target.value)}
                                className="glass-input"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-accent text-white hover:bg-accent/80 mt-4"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                        Generate {reportType === 'Invoice' ? 'Invoice' : 'Report'}
                    </Button>
                </CardContent>
            </Card>

            {/* Preview Panel */}
            <Card className="glass-card flex flex-col h-[600px]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>Preview</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleSendToDiscord} disabled={!generatedText || sending}>
                            {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                            Send to Discord
                        </Button>
                        <Button variant="ghost" size="sm" onClick={copyToClipboard} disabled={!generatedText}>
                            <Copy className="w-4 h-4 mr-2" /> Copy
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 relative">
                    <Textarea
                        value={generatedText}
                        readOnly
                        className="w-full h-full min-h-[500px] resize-none border-0 bg-black/30 font-mono text-sm p-4 focus-visible:ring-0"
                        placeholder="Generated content will appear here..."
                    />
                </CardContent>
            </Card>
        </div>
    );
}

function formatInvoice(items: { description: string; quantity: number; price: number }[], discountStr: string, to: string, from: string) {
    const fmt = (n: number) => `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const pad = (str: string, length: number) => str.padEnd(length);
    const padStart = (str: string, length: number) => str.padStart(length);
    const center = (str: string, width: number = 80) => {
        const padding = Math.max(0, Math.floor((width - str.length) / 2));
        return ' '.repeat(padding) + str;
    };

    const generatedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const invoiceId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    let subtotal = 0;
    const itemRows = items.map(item => {
        const total = item.quantity * item.price;
        subtotal += total;
        // Description (45 chars) | Qty (5) | Price (12) | Total (12)
        const desc = item.description.substring(0, 44).padEnd(45);
        const qty = item.quantity.toString().padStart(5);
        const price = fmt(item.price).padStart(12);
        const lineTotal = fmt(total).padStart(12);
        return ` ${desc} ${qty} ${price} ${lineTotal}`;
    }).join('\n');

    const discountPct = parseFloat(discountStr) || 0;
    const discountAmount = (subtotal * discountPct) / 100;
    const grandTotal = subtotal - discountAmount;

    return `
${center('GM BURGERSHOT INVOICE')}

FROM:                                           TO:
GM BURGERSHOT                                   ${to.substring(0, 30)}
${(from || 'Manager').substring(0, 30).padEnd(46)}

                                                Date:       ${generatedDate}
                                                Invoice #:  ${invoiceId}

--------------------------------------------------------------------------------
 ITEM DESCRIPTION                                QTY   UNIT PRICE        TOTAL
--------------------------------------------------------------------------------
${itemRows || center('No Items', 80)}

--------------------------------------------------------------------------------
 SUBTOTAL                                                    ${fmt(subtotal).padStart(20)}
 DISCOUNT (${discountPct}%)                                             -${fmt(discountAmount).padStart(19)}
--------------------------------------------------------------------------------
 GRAND TOTAL                                                 ${fmt(grandTotal).padStart(20)}
--------------------------------------------------------------------------------
 
 PAYMENT DETAILS:
 Bank Account: 1509517987 (GM Burgershot)

SAFETY NOTICE:
The Food can be consumed upto 1% durability. Anything consumed less than 1% is
harmful and GM Burgershot is not responsible for it.

ACKNOWLEDGEMENT:
I acknowledge receipt of the above items in good condition and agree to the
terms stated herein.

Signature: ${from || '______________________'}
`.replace(/^\n/, '');
}

function formatReport(type: string, data: any, to: string, from: string, membersRemoved: string) {
    // Format currency
    const fmt = (n: number) => `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const pad = (str: string, length: number) => str.padEnd(length);
    const padStart = (str: string, length: number) => str.padStart(length);
    const center = (str: string, width: number = 80) => {
        const padding = Math.max(0, Math.floor((width - str.length) / 2));
        return ' '.repeat(padding) + str;
    };

    const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const periodStart = new Date(data.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const periodEnd = new Date(data.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return `
${center('GM BURGERSHOT')}
${center(`${type.toUpperCase()} PERFORMANCE REVIEW`)}

REPORT METADATA
================================================================================
Date Generated: ${generatedDate}
Report Period:  ${periodStart} - ${periodEnd}
Prepared By:    ${from || '[Name]'}
Recipient:      ${to || 'High Command'}
================================================================================

FINANCIAL OVERVIEW
--------------------------------------------------------------------------------
 Metric                   | Amount
--------------------------|-----------------------------------------------------
 Total Revenue            | ${padStart(fmt(data.totalIncome), 20)}
 Total Operational Costs  | ${padStart(fmt(data.totalExpense), 20)}
--------------------------|-----------------------------------------------------
 NET OPERATIONAL PROFIT   | ${padStart(fmt(data.netProfit), 20)}
--------------------------------------------------------------------------------

HUMAN RESOURCES SUMMARY
--------------------------------------------------------------------------------
 Metric                   | Count
--------------------------|-----------------------------------------------------
 New Members              | ${padStart(data.membersAdded.toString(), 20)}
 Members Removed          | ${padStart(membersRemoved || '0', 20)}
--------------------------------------------------------------------------------

CERTIFICATION
--------------------------------------------------------------------------------
I hereby certify that the information provided in this report is accurate and
reflects the financial and operational status of GM Burgershot.

Signature: NIMAL PRINCE
Title:     Restaurant Manager
Date:      ${generatedDate}
`.replace(/^\n/, '');
}
