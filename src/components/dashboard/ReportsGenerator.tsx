'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, FileText, Loader2, Copy, Send } from 'lucide-react';
import { generateReportData } from '@/actions/report';
import { sendReportToDiscord } from '@/actions/discord';
import { logActivity } from '@/actions/log';
import { useToast } from '@/hooks/use-toast';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Shared Schema
const ItemSchema = z.object({
    description: z.string().min(1, "Description required"),
    quantity: z.number().min(1, "Qty must be >= 1"),
    price: z.number().min(0, "Price must be >= 0")
});

// Recurring Contract Schema
const RecurringFormSchema = z.object({
    startDate: z.string().min(1, "Start Date required"),
    frequency: z.enum(["Weekly", "Bi-Weekly", "Daily"]),
    collectionDay: z.string().min(1, "Collection Day required"),
    collectionTime: z.string().min(1, "Time required"),
    deliveryFee: z.number().min(0),
    securityDeposit: z.number().min(0),
    lateFee: z.number().min(0),
    paymentMethod: z.enum(["Pay-on-Collection", "Weekly Invoice"]),
    items: z.array(ItemSchema)
});
type RecurringFormValues = z.infer<typeof RecurringFormSchema>;

export function ReportsGenerator({ userRole = 'staff' }: { userRole?: string }) {
    const { toast } = useToast();
    const isAdmin = userRole === 'admin';
    const canManageBulk = userRole === 'admin' || userRole === 'bulkhead';

    // Default to Weekly (Admin) or Invoice (Staff).
    const [reportType, setReportType] = useState(isAdmin ? 'Weekly' : 'Invoice');

    // Report Metadata State
    const [reportTo, setReportTo] = useState(''); // Acts as Client Name (Org)
    const [clientRep, setClientRep] = useState(''); // Acts as Client Representative for Recurring
    const [reportFrom, setReportFrom] = useState(''); // Acts as Service Provider Rep
    const [generatedText, setGeneratedText] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(false);

    const [autoCalcDeposit, setAutoCalcDeposit] = useState(true);

    // Invoice Form
    const InvoiceFormSchema = z.object({
        discount: z.string().regex(/^\d*\.?\d*$/, "Invalid discount (number only)"),
        items: z.array(ItemSchema)
    });
    type InvoiceFormValues = z.infer<typeof InvoiceFormSchema>;

    const invoiceForm = useForm<InvoiceFormValues>({
        resolver: zodResolver(InvoiceFormSchema),
        defaultValues: { discount: '', items: [] }
    });

    const { fields: invoiceFields, append: appendInvoice, remove: removeInvoice } = useFieldArray({
        control: invoiceForm.control,
        name: "items"
    });

    // Citizen Contract Form
    const CitizenContractSchema = z.object({
        eventDate: z.string().min(1, "Event Date required"),
        items: z.array(ItemSchema)
    });
    type CitizenContractValues = z.infer<typeof CitizenContractSchema>;

    const citizenForm = useForm<CitizenContractValues>({
        resolver: zodResolver(CitizenContractSchema),
        defaultValues: { items: [] }
    });

    const { fields: citizenFields, append: appendCitizen, remove: removeCitizen } = useFieldArray({
        control: citizenForm.control,
        name: "items"
    });

    // Event Order Contract Form
    const EventContractSchema = z.object({
        eventDate: z.string().min(1, "Event Date required"),
        collectionTime: z.string().min(1, "Collection Time required"),
        items: z.array(ItemSchema)
    });
    type EventContractValues = z.infer<typeof EventContractSchema>;

    const eventContractForm = useForm<EventContractValues>({
        resolver: zodResolver(EventContractSchema),
        defaultValues: { items: [], collectionTime: '10:30 PM' }
    });

    const { fields: eventFields, append: appendEvent, remove: removeEvent } = useFieldArray({
        control: eventContractForm.control,
        name: "items"
    });

    // Recurring Contract Form
    const recurringForm = useForm<RecurringFormValues>({
        resolver: zodResolver(RecurringFormSchema),
        defaultValues: {
            startDate: new Date().toISOString().split('T')[0],
            frequency: "Weekly",
            collectionDay: "Monday",
            collectionTime: "10:30PM",
            deliveryFee: 100000,
            securityDeposit: 0,
            lateFee: 50000000,
            paymentMethod: "Weekly Invoice",
            items: []
        }
    });

    const { fields: recurringFields, append: appendRecurring, remove: removeRecurring } = useFieldArray({
        control: recurringForm.control,
        name: "items"
    });

    // Auto-Calculate Security Deposit Logic
    const watchedItems = recurringForm.watch('items');
    const watchedDeliveryFee = recurringForm.watch('deliveryFee');

    useEffect(() => {
        if (autoCalcDeposit && reportType === 'Recurring Contract') {
            const itemsTotal = watchedItems?.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0) || 0;
            const delivery = watchedDeliveryFee || 0;
            const cycleCost = itemsTotal + delivery;
            const deposit = cycleCost * 2;

            // Only update if value changed to avoid loops (though setValue handles strict eq)
            const current = recurringForm.getValues('securityDeposit');
            if (current !== deposit) {
                recurringForm.setValue('securityDeposit', deposit);
            }
        }
    }, [watchedItems, watchedDeliveryFee, autoCalcDeposit, reportType, recurringForm]);


    // General Report Date Form
    const today = new Date().toISOString().split('T')[0];
    const DateRangeSchema = z.object({
        startDate: z.string().min(1, "Start Date required"),
        endDate: z.string().min(1, "End Date required"),
        membersRemoved: z.string().regex(/^\d*$/, "Numbers only").optional()
    });
    type DateRangeValues = z.infer<typeof DateRangeSchema>;

    const reportForm = useForm<DateRangeValues>({
        resolver: zodResolver(DateRangeSchema),
        defaultValues: { startDate: today, endDate: today, membersRemoved: '' }
    });

    const handleGenerate = async () => {
        setLoading(true);
        setGeneratedText('');
        try {
            let reportText = '';

            if (reportType === 'Invoice') {
                const isValid = await invoiceForm.trigger();
                if (!isValid) throw new Error("Please correct invoice errors.");
                const data = invoiceForm.getValues();
                reportText = formatInvoice(data.items, data.discount, reportTo, reportFrom);
            }
            else if (reportType === 'Citizen Contract') {
                const isValid = await citizenForm.trigger();
                if (!isValid) throw new Error("Please correct contract errors.");
                const data = citizenForm.getValues();
                reportText = formatCitizenContract(data, reportTo, reportFrom);
            }
            else if (reportType === 'Event Order Contract') {
                const isValid = await eventContractForm.trigger();
                if (!isValid) throw new Error("Please correct contract errors.");
                const data = eventContractForm.getValues();
                reportText = formatEventContract(data, reportTo, reportFrom);
            }
            else if (reportType === 'Recurring Contract') {
                const isValid = await recurringForm.trigger();
                if (!isValid) throw new Error("Please correct contract errors.");
                const data = recurringForm.getValues();
                reportText = formatRecurringContract(data, reportTo, clientRep, reportFrom);
            }
            else {
                const isValid = await reportForm.trigger();
                if (!isValid) throw new Error("Please correct date errors.");
                const data = reportForm.getValues();
                const result = await generateReportData(new Date(data.startDate), new Date(data.endDate));
                if (!result.success || !result.data) throw new Error(result.error || 'Unknown error occurred');
                reportText = formatReport(reportType, result.data, reportTo, reportFrom, data.membersRemoved || '0');
            }

            setGeneratedText(reportText);
            toast({
                title: "Generated successfully!",
                description: "You can copy the text below."
            });
            await logActivity('Generate Report', `Generated ${reportType} for ${reportTo || 'Unknown Client'} (From: ${reportFrom || 'Unknown'})`);
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "Failed", description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!generatedText) return;
        navigator.clipboard.writeText(generatedText);
        toast({ title: "Copied!", description: "Copied to clipboard." });
    };

    const handleSendToDiscord = async () => {
        if (!generatedText) return;
        setSending(true);
        try {
            const result = await sendReportToDiscord(generatedText, reportType);
            if (result.success) toast({ title: "Sent!", description: "Sent to Discord." });
            else throw new Error(result.error);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed", description: error.message });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[45fr_55fr] gap-6">
            <Card className="glass-card h-fit">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-accent" /> Generator
                    </CardTitle>
                    <CardDescription>Select type and input details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Report Type</Label>
                        <Select value={reportType} onValueChange={setReportType}>
                            <SelectTrigger className="glass-input">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {isAdmin && <>
                                    <SelectItem value="Weekly">Weekly Report</SelectItem>
                                    <SelectItem value="Monthly">Monthly Report</SelectItem>
                                </>}
                                <SelectItem value="Invoice">Invoice</SelectItem>
                                {canManageBulk && <>
                                    <SelectItem value="Citizen Contract">Citizen Bulk Order Contract</SelectItem>
                                    <SelectItem value="Event Order Contract">Event Order Contract</SelectItem>
                                    <SelectItem value="Recurring Contract">Recurring Bulk Order Contract</SelectItem>
                                </>}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Report Specific Forms */}
                    {reportType === 'Invoice' && (
                        <div className="space-y-4 border-t border-white/10 pt-4">
                            <Label>Invoice Items</Label>
                            <ItemsList fields={invoiceFields} append={appendInvoice} remove={removeInvoice} register={invoiceForm.register} errors={invoiceForm.formState.errors} />
                            <div className="space-y-2">
                                <Label>Discount (%)</Label>
                                <Input placeholder="0" {...invoiceForm.register('discount')} className="glass-input" />
                            </div>
                        </div>
                    )}

                    {reportType === 'Citizen Contract' && (
                        <div className="space-y-4 border-t border-white/10 pt-4">
                            <div className="space-y-2">
                                <Label>Event Date</Label>
                                <Input type="date" {...citizenForm.register('eventDate')} className="glass-input" />
                                {citizenForm.formState.errors.eventDate && <span className="text-xs text-red-400">{citizenForm.formState.errors.eventDate.message}</span>}
                            </div>
                            <Label className="mt-4 block">Order Items</Label>
                            <ItemsList fields={citizenFields} append={appendCitizen} remove={removeCitizen} register={citizenForm.register} errors={citizenForm.formState.errors} />
                        </div>
                    )}

                    {reportType === 'Event Order Contract' && (
                        <div className="space-y-4 border-t border-white/10 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Event Date</Label>
                                    <Input type="date" {...eventContractForm.register('eventDate')} className="glass-input" />
                                    {eventContractForm.formState.errors.eventDate && <span className="text-xs text-red-400">{eventContractForm.formState.errors.eventDate.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Collection Time</Label>
                                    <Input placeholder="10:30 PM" {...eventContractForm.register('collectionTime')} className="glass-input" />
                                    {eventContractForm.formState.errors.collectionTime && <span className="text-xs text-red-400">{eventContractForm.formState.errors.collectionTime.message}</span>}
                                </div>
                            </div>
                            <Label className="mt-4 block">Event Items</Label>
                            <ItemsList fields={eventFields} append={appendEvent} remove={removeEvent} register={eventContractForm.register} errors={eventContractForm.formState.errors} />
                        </div>
                    )}

                    {reportType === 'Recurring Contract' && (
                        <div className="space-y-4 border-t border-white/10 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Contract Start Date</Label>
                                    <Input type="date" {...recurringForm.register('startDate')} className="glass-input" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Frequency</Label>
                                    <Select
                                        value={recurringForm.watch('frequency')}
                                        onValueChange={(val: any) => recurringForm.setValue('frequency', val)}
                                    >
                                        <SelectTrigger className="glass-input"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Weekly">Weekly</SelectItem>
                                            <SelectItem value="Bi-Weekly">Bi-Weekly</SelectItem>
                                            <SelectItem value="Daily">Daily</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Collection Day</Label>
                                    <Input placeholder="e.g. Monday" {...recurringForm.register('collectionDay')} className="glass-input" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Collection Time</Label>
                                    <Input placeholder="10:30PM" {...recurringForm.register('collectionTime')} className="glass-input" />
                                </div>
                            </div>

                            <Label className="mt-4 block">Standing Order Items</Label>
                            <ItemsList fields={recurringFields} append={appendRecurring} remove={removeRecurring} register={recurringForm.register} errors={recurringForm.formState.errors} />

                            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                                <div className="space-y-2">
                                    <Label>Delivery Fee</Label>
                                    <Input type="number" {...recurringForm.register('deliveryFee', { valueAsNumber: true })} className="glass-input" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Late Fee</Label>
                                    <Input type="number" {...recurringForm.register('lateFee', { valueAsNumber: true })} className="glass-input" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Security Deposit (Refundable)</Label>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="auto-deposit"
                                            checked={autoCalcDeposit}
                                            onCheckedChange={(checked) => setAutoCalcDeposit(checked as boolean)}
                                            className="h-4 w-4 border-white/50"
                                        />
                                        <label htmlFor="auto-deposit" className="text-xs font-medium leading-none cursor-pointer">
                                            Auto (2x Cycle)
                                        </label>
                                    </div>
                                </div>
                                <Input
                                    type="number"
                                    {...recurringForm.register('securityDeposit', { valueAsNumber: true })}
                                    className={`glass-input ${autoCalcDeposit ? 'opacity-70' : ''}`}
                                    readOnly={autoCalcDeposit}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Billing Method</Label>
                                <Select
                                    value={recurringForm.watch('paymentMethod')}
                                    onValueChange={(val: any) => recurringForm.setValue('paymentMethod', val)}
                                >
                                    <SelectTrigger className="glass-input"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pay-on-Collection">Pay-on-Collection</SelectItem>
                                        <SelectItem value="Weekly Invoice">Weekly Invoice</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {(reportType === 'Weekly' || reportType === 'Monthly') && (
                        <div className="space-y-4 border-t border-white/10 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input type="date" {...reportForm.register('startDate')} className="glass-input" />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input type="date" {...reportForm.register('endDate')} className="glass-input" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Members Removed</Label>
                                <Input type="text" placeholder="0" {...reportForm.register('membersRemoved')} className="glass-input" />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                        <div className="space-y-2">
                            <Label>{reportType === 'Citizen Contract' || reportType === 'Event Order Contract' ? 'Service Provider Rep' : 'From'}</Label>
                            <Input placeholder={reportType === 'Citizen Contract' ? 'GM | Name' : 'Manager Name'} value={reportFrom} onChange={(e) => setReportFrom(e.target.value)} className="glass-input" />
                        </div>
                        <div className="space-y-2">
                            <Label>{reportType === 'Citizen Contract' || reportType === 'Event Order Contract' || reportType === 'Recurring Contract' ? 'Client Organization / Name' : 'To'}</Label>
                            <Input placeholder={reportType === 'Citizen Contract' ? 'Client Name' : 'Recipient / Org Name'} value={reportTo} onChange={(e) => setReportTo(e.target.value)} className="glass-input" />
                        </div>
                        {reportType === 'Recurring Contract' && (
                            <div className="space-y-2 col-span-2">
                                <Label>Client Representative</Label>
                                <Input placeholder="Representative Name" value={clientRep} onChange={(e) => setClientRep(e.target.value)} className="glass-input" />
                            </div>
                        )}
                    </div>

                    <Button onClick={handleGenerate} disabled={loading} className="w-full bg-accent text-white hover:bg-accent/80 mt-4">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                        Generate
                    </Button>
                </CardContent>
            </Card>

            <Card className="glass-card flex flex-col h-[600px]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>Preview</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleSendToDiscord} disabled={!generatedText || sending}>
                            {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />} Send
                        </Button>
                        <Button variant="ghost" size="sm" onClick={copyToClipboard} disabled={!generatedText}>
                            <Copy className="w-4 h-4 mr-2" /> Copy
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                    <Textarea value={generatedText} readOnly className="w-full h-full min-h-[500px] resize-none border-0 bg-black/30 font-mono text-base text-white/90 p-4" placeholder="Generated content..." />
                </CardContent>
            </Card>
        </div >
    );
}

// Helper Component for Items List
function ItemsList({ fields, append, remove, register, errors }: any) {
    return (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground px-2 font-mono">
                <div className="col-span-6">Item Name</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-3">Price</div>
            </div>
            {fields.map((field: any, index: number) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-center bg-black/20 p-2 rounded">
                    <div className="col-span-6">
                        <Input placeholder="Item Name" className="glass-input h-8 text-xs" {...register(`items.${index}.description` as const)} />
                        {errors.items?.[index]?.description && <span className="text-[10px] text-red-400 block">{errors.items[index]?.description?.message}</span>}
                    </div>
                    <div className="col-span-2">
                        <Input type="number" placeholder="Qty" className="glass-input h-8 text-xs" {...register(`items.${index}.quantity` as const, { valueAsNumber: true })} />
                    </div>
                    <div className="col-span-3">
                        <Input type="number" placeholder="Price" className="glass-input h-8 text-xs" {...register(`items.${index}.price` as const, { valueAsNumber: true })} />
                    </div>
                    <div className="col-span-1 flex justify-center">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => remove(index)}>&times;</Button>
                    </div>
                </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => append({ description: '', quantity: 1, price: 0 })} className="w-full h-8 border-dashed text-xs">+ Add Item</Button>
        </div>
    );
}

// Logic Functions

function formatInvoice(items: { description: string; quantity: number; price: number }[], discountStr: string, to: string, from: string) {
    const fmt = (n: number) => `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const center = (str: string, width: number = 80) => {
        const padding = Math.max(0, Math.floor((width - str.length) / 2));
        return ' '.repeat(padding) + str;
    };
    const generatedDate = new Date().toLocaleDateString('en-GB');
    const invoiceId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    let subtotal = 0;
    const itemRows = items.map(item => {
        const total = item.quantity * item.price;
        subtotal += total;
        return ` ${(item.description.substring(0, 44)).padEnd(45)} ${(item.quantity.toString()).padStart(5)} ${(fmt(item.price)).padStart(12)} ${(fmt(total)).padStart(12)}`;
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
    const fmt = (n: number) => `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const padStart = (str: string, length: number) => str.padStart(length);
    const center = (str: string, width: number = 80) => {
        const padding = Math.max(0, Math.floor((width - str.length) / 2));
        return ' '.repeat(padding) + str;
    };

    const generatedDate = new Date().toLocaleDateString('en-GB');
    const periodStart = new Date(data.startDate).toLocaleDateString('en-GB');
    const periodEnd = new Date(data.endDate).toLocaleDateString('en-GB');

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

function formatCitizenContract(data: { items: any[], eventDate: string }, clientName: string, providerName: string) {
    const fmt = (n: number) => `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
    const center = (str: string, width: number = 80) => {
        // Ensure non-negative padding
        const padding = Math.max(0, Math.floor((width - str.length) / 2));
        return ' '.repeat(padding) + str;
    };
    const tableRow = (label: string, value: string) => {
        return `| ${label.padEnd(46)} | ${value.padStart(27)} |`;
    };
    const separator = `+${'-'.repeat(48)}+${'-'.repeat(29)}+`;

    // Dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = today.toLocaleDateString('en-GB'); // DD/MM/YYYY

    const eventDateObj = new Date(data.eventDate);
    const eventDateStr = eventDateObj.toLocaleDateString('en-GB');

    // Collection Date is 1 day prior
    const colDateObj = new Date(eventDateObj);
    colDateObj.setDate(colDateObj.getDate() - 1);
    const collectionDateStr = colDateObj.toLocaleDateString('en-GB');

    // Calculate Notice Days (Collection Date - Today)
    const diffTime = colDateObj.getTime() - today.getTime();
    const daysNotice = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Fee Logic
    let feeName = "Standard";
    let feeType = "None"; // For T&C or display
    let feeAmount = 0;
    let subtotal = 0;
    let totalQty = 0;

    const itemRows = data.items.map((item: any, i: number) => {
        const total = item.quantity * item.price;
        subtotal += total;
        totalQty += item.quantity;

        const idx = `${i + 1}.`;
        const name = item.description.substring(0, 30).padEnd(30);
        const qty = item.quantity.toString().padEnd(15);
        const price = fmt(item.price).padEnd(20);
        const lineTotal = fmt(total);
        return `${idx.padEnd(3)} ${name} ${qty} ${price} ${lineTotal}`;
    }).join('\n');

    if (daysNotice < 1) {
        feeName = "SuperFine Fee (3x)";
        feeType = "SuperFine (<1 Day Notice)";
        feeAmount = subtotal * 2; // Adding 2x makes total 3x
    } else if (daysNotice <= 2) {
        feeName = "Superfast Fee (30%)";
        feeType = "Superfast (1-2 Days Notice)";
        feeAmount = Math.round(subtotal * 0.30);
    } else if (daysNotice <= 4) {
        feeName = "Late Fee (15%)";
        feeType = "Late (3-4 Days Notice)";
        feeAmount = Math.round(subtotal * 0.15);
    } else {
        feeName = "Standard (No Fee)";
        feeType = "Standard (5+ Days Notice)";
        feeAmount = 0;
    }

    const grandTotal = subtotal + feeAmount;
    const advance = Math.round(grandTotal * 0.50);
    const balance = grandTotal - advance;

    return `
${center('GM BURGERSHOT')}
${center('CITIZEN BULK ORDER AGREEMENT')}

Date of Booking: ${bookingDate}

1. Parties Involved
    - SERVICE PROVIDER
      Name: GM Burgershot
      Representative: ${(providerName || 'Nimal Prince').toUpperCase()}
      
    - CLIENT
      Representative: ${(clientName || 'OLANGA KUTTAN').toUpperCase()}

2. EVENT & COLLECTION SCHEDULE
Per company policy, orders must be collected one (1) day prior to the event.
* Target Event Date: ${eventDateStr}
* Mandatory Collection Date: ${collectionDateStr}
* Days Notice: ${daysNotice} Days (${feeType})
* Collection Time: 10:30pm


3. ORDER SPECIFICATIONS
     Item Name                          Quantity              Unit Price           Total
----------------------------------------------------------------------------------------
${itemRows}
----------------------------------------------------------------------------------------
Total Quantity: ${totalQty}

4. FINANCIAL SUMMARY
${separator}
${tableRow("Item Subtotal", fmt(subtotal))}
${tableRow(feeName, fmt(feeAmount))}
${separator}
${tableRow("GRAND TOTAL", fmt(grandTotal))}
${separator}
${tableRow("50% ADVANCE (Non-Refundable)", fmt(advance))}
${tableRow("REMAINING BALANCE (Due on Collection)", fmt(balance))}
${separator}


5. TERMS & CONDITIONS
- All bulk orders require a minimum of 5 days notice for Standard rates.
- Current Order Classification: **${feeType}**. 
- This contract covers one single bulk order. Split deliveries are prohibited.
- The 50% Advance Payment is strictly non-refundable.

*Collection & Liability:
- The Client acknowledges that food is being collected 24 hours prior to consumption.
- Upon handover on the Collection Date, GM Burgershot transfers all liability regarding food safety to the Client.
- GM Burgershot is not responsible for spoilage due to improper storage.
- If uncollected, food is discarded, and Client remains liable for the Full Grand Total.

6. ACCEPTANCE
By signing below, both parties agree to the terms listed above.

For GM Burgershot: Signature: GM | ${(providerName || 'Nimal Prince').toUpperCase()} Date: ${collectionDateStr}

For Client: Signature: ${(clientName || '__________________').toUpperCase()} Date: ${collectionDateStr} 
`.replace(/^\n/, '');
}


function formatEventContract(data: { items: any[], eventDate: string, collectionTime: string }, clientName: string, providerName: string) {
    const fmt = (n: number) => `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
    const center = (str: string, width: number = 80) => {
        const padding = Math.max(0, Math.floor((width - str.length) / 2));
        return ' '.repeat(padding) + str;
    };
    const tableRow = (label: string, value: string) => `| ${label.padEnd(46)} | ${value.padStart(27)} |`;
    const separator = `+${'-'.repeat(48)}+${'-'.repeat(29)}+`;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = today.toLocaleDateString('en-GB');

    const eventDateObj = new Date(data.eventDate);
    const eventDateStr = eventDateObj.toLocaleDateString('en-GB');

    const colDateObj = new Date(eventDateObj);
    colDateObj.setDate(colDateObj.getDate() - 1);
    const collectionDateStr = colDateObj.toLocaleDateString('en-GB');

    const diffTime = colDateObj.getTime() - today.getTime();
    const daysNotice = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let feeName = "Standard (5+ Days)";
    let feeType = "None";
    let feeAmount = 0;
    let subtotal = 0;
    let totalQty = 0;

    const itemRows = data.items.map((item: any, i: number) => {
        const total = item.quantity * item.price;
        subtotal += total;
        totalQty += item.quantity;
        return `${(i + 1).toString().padEnd(3)} ${(item.description.substring(0, 30)).padEnd(30)} ${(item.quantity.toString()).padEnd(15)} ${fmt(item.price).padEnd(12)} ${fmt(total)}`;
    }).join('\n');

    // Fee Logic based on NEW Policy
    if (daysNotice < 1) { // < 24 Hours
        feeName = "Tier 3: Superfine (< 24h)";
        feeType = "Tier 3 (3x)";
        feeAmount = subtotal * 2; // Total becomes 3x
    } else if (daysNotice <= 2) { // 24-48 Hours (1-2 Days)
        feeName = "Tier 2: Rush Fee (24-48h)";
        feeType = "Tier 2 (30%)";
        feeAmount = Math.round(subtotal * 0.30);
    } else if (daysNotice <= 4) { // 3-4 Days
        feeName = "Tier 1: Surcharge (3-4 Days)";
        feeType = "Tier 1 (15%)";
        feeAmount = Math.round(subtotal * 0.15);
    } else {
        feeName = "Standard";
        feeType = "Standard";
        feeAmount = 0;
    }

    const grandTotal = subtotal + feeAmount;
    const advance = Math.round(grandTotal * 0.50); // 50% Advance
    const balance = grandTotal - advance;

    const feeDisplay = feeAmount > 0 ? fmt(feeAmount) : '$ 0';
    const feeRow = feeAmount > 0 ? tableRow(feeName, feeDisplay) : tableRow("Surcharge/Fee", "$ 0");

    return `
${center('GM BURGERSHOT')}
${center('BULK ORDER & CATERING POLICY')}

Date of Booking: ${bookingDate}

1. PARTIES INVOLVED
    - SERVICE PROVIDER
      Name: GM Burgershot 
      Representative: ${(providerName || 'Nimal Prince').toUpperCase()}

    - CLIENT
      Organization: ${(clientName || 'X-Club').toUpperCase()}

2. SCHEDULING & LEAD TIMES
   Booking Lead Time: Orders must be initiated a minimum of 5 Business Days 
   prior to the Collection Date.

   * Target Event Date: ${eventDateStr}
   * Mandatory Collection Date: ${collectionDateStr} (1 Day Prior)
   * Collection Time: ${data.collectionTime || '10:30 PM'}
   * Lead Time Classification: ${daysNotice} Days (${feeType})

3. ORDER SPECIFICATIONS
     Item Name                          Quantity              Unit Price           Total
${itemRows}
Total Quantity: ${totalQty}

4. FINANCIAL SUMMARY
${separator}
${tableRow("Item Subtotal", fmt(subtotal))}
${feeRow}
${separator}
${tableRow("GRAND TOTAL", fmt(grandTotal))}
${separator}
${tableRow("50% ADVANCE (Non-Refundable)", fmt(advance))}
${tableRow("REMAINING BALANCE (Due -24h)", fmt(balance))}
${separator}

5. TERMS & CONDITIONS (ABRIDGED)
   Full policy available at GM Management.

   FINANCIAL OBLIGATIONS:
   - Advance Payment: A 50% Non-Refundable Deposit is required upon contract 
     signing to secure inventory and labor.
   - Final Settlement: The remaining 50% balance must be cleared 24 hours 
     prior to the scheduled collection time.
   - Cancellation <4 Days: Deposit Forfeited. <48 Hours: 100% Due.

   QUALITY CONTROL & LIABILITY:
   - Chain of Custody: Liability transfers to Client immediately upon handover.
   - Food Safety: GM Burgershot certifies food leaves at safe temps.
   - Client Responsibility: Maintaining below 5°C and reheating >75°C.
   - Waiver: Client indemnifies GM Burgershot against claims arising from 
     consumption >32 hours after handover or improper storage.
   - Durability: Food consumed <1% durability is strictly forbidden.

6. ACCEPTANCE
   By signing below, the Client accepts the "Bulk Order & Catering Policy" 
   and agrees to the financial terms above.

   For GM Burgershot: ___________________________ Date: ${collectionDateStr}
   (Signed by ${(providerName || 'Manager').toUpperCase()})

   For ${(clientName || 'Client').toUpperCase()}: ___________________________ Date: ${collectionDateStr}
`.replace(/^\n/, '');
}

function formatRecurringContract(data: RecurringFormValues, clientName: string, clientRep: string, providerName: string) {
    const fmt = (n: number) => `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
    const center = (str: string, width: number = 80) => {
        const padding = Math.max(0, Math.floor((width - str.length) / 2));
        return ' '.repeat(padding) + str;
    };
    const tableRow = (label: string, value: string) => `| ${label.padEnd(46)} | ${value.padStart(27)} |`;
    const separator = `+${'-'.repeat(48)}+${'-'.repeat(29)}+`;

    const agreementDate = new Date().toLocaleDateString('en-GB');
    const startDate = new Date(data.startDate).toLocaleDateString('en-GB');

    let subtotal = 0;
    let totalQty = 0;

    const itemRows = data.items.map((item, i) => {
        const total = item.quantity * item.price;
        subtotal += total;
        totalQty += item.quantity;
        return `${(i + 1).toString().padEnd(3)} ${(item.description.substring(0, 30)).padEnd(30)} ${(item.quantity.toString()).padEnd(8)} ${fmt(item.price).padEnd(12)} ${fmt(total)}`;
    }).join('\n');

    const recurringCost = subtotal;
    const totalPayablePerCycle = recurringCost + data.deliveryFee;

    // Auto-calculate security deposit if 0 (2x cycle)
    const securityDeposit = data.securityDeposit > 0 ? data.securityDeposit : (totalPayablePerCycle * 2);

    return `
${center('GM BURGERSHOT')}
${center('RECURRING BULK ORDER AGREEMENT')}

Agreement Date: ${agreementDate}

1. PARTIES INVOLVED
SERVICE PROVIDER (SUPPLIER): 
Name: GM Burgershot
Representative: ${(providerName || 'Manager').toUpperCase()}
Contact: MADHAVAN UNNI (91732487)

CLIENT (RETAILER/PARTNER)
Name: ${(clientName || 'Client Org').toUpperCase()}
Representative: ${(clientRep || 'Client Rep').toUpperCase()} (LEADER)

2. CONTRACT DURATION & SCHEDULE
This agreement represents a standing order for an indefinite period, subject to the termination clauses below.

Contract Start Date: ${startDate}
Supply Frequency: [${data.frequency === 'Weekly' ? 'X' : ' '}] Weekly  [${data.frequency === 'Bi-Weekly' ? 'X' : ' '}] Bi-Weekly  [${data.frequency === 'Daily' ? 'X' : ' '}] Daily
Designated Collection/Handover Day: ${(data.collectionDay || 'MONDAY').toUpperCase()}

Designated Time: ${(data.collectionTime || '10:30PM').toUpperCase()}

3. STANDING ORDER SPECIFICATIONS
The following items will be prepared and made available for every cycle defined above.

Item Name                         Quantity    Unit Price     Total Per Cycle
---------------------------------------------------------------------------
${itemRows}
---------------------------------------------------------------------------
TOTALS   Total Qty: ${totalQty.toString().padEnd(10)}            ${fmt(subtotal)}
(Client may adjust quantities for a specific week by providing 48 hours written notice.)

4. FINANCIAL SUMMARY & PAYMENT TERMS
A. PRICING
${separator}
${tableRow("Recurring Cost Per Cycle", fmt(recurringCost))}
${tableRow("Delivery/Handling Fee", fmt(data.deliveryFee))}
${separator}
${tableRow("TOTAL PAYABLE PER CYCLE", fmt(totalPayablePerCycle))}
${separator}

B. SECURITY DEPOSIT:
To secure this contract and cover stock allocation, the Client agrees to a Refundable Security Deposit equivalent to two (2) cycles of orders.

Security Deposit Amount: ${fmt(securityDeposit)} (Due upon signing)

This deposit is refundable upon contract termination, provided all outstanding invoices are cleared.

C. BILLING & PAYMENT SCHEDULE: Select the agreed payment method for the recurring orders:

[${data.paymentMethod === 'Pay-on-Collection' ? 'X' : ' '}] Pay-on-Collection: Payment must be cleared in full at the time of pickup/handover each week.

[${data.paymentMethod === 'Weekly Invoice' ? 'X' : ' '}] Weekly Invoice: Invoice generated on Monday; Due by Friday of the same week.

D. LATE FEES

A late fee of ${fmt(data.lateFee)} applies to any payment overdue by more than 3 days.

5. TERMS & CONDITIONS
1. Order Modifications: Permanent changes to the Standing Order must be requested 7 days in advance. Temporary changes for a specific week require 48 hours notice.

2. Contract Termination: Either party may terminate this agreement with 14 days written notice.
If the Client terminates without notice, the Security Deposit will be forfeited.

3. Collection & Liability (Strict):
Handover: Upon handover on the Designated Collection Day, GM Burgershot transfers all liability regarding food safety, temperature control, and storage to the Client.

Storage: The Client is solely responsible for maintaining appropriate refrigeration/heating standards once the items leave GM Burgershot premises. GM Burgershot is not liable for spoilage due to Client negligence.

Uncollected Goods: If the order is not collected on the agreed day, the food will be discarded for safety reasons, but the Client remains liable for the full cost of that cycle, as the stock was prepared specifically for them.

4. Price Fluctuations: GM Burgershot reserves the right to adjust Unit Prices based on raw material market rates. A 15-day notice will be provided to the Client before any price increase takes effect.

6. ACCEPTANCE
By signing below, the Client agrees to the recurring supply terms, the security deposit requirement, and the liability transfer.

For GM Burgershot
Date: ${agreementDate}
Signature: 
${(providerName || 'MADHAVAN UNNI').toUpperCase()}

For Client
Date: ${agreementDate}
Signature: ${clientRep} 
`.replace(/^\n/, '');
}
