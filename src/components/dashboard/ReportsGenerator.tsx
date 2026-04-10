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
import { generateReportData, generateFullShopReportData, generateSalesReportData, FullReportData } from '@/actions/report';
import { sendReportToDiscord } from '@/actions/discord';
import { logActivity } from '@/actions/log';
import { generateShopPDF } from '@/lib/pdf-generator';
import { formatInvoice, formatReport, formatCitizenContract, formatEventContract, formatRecurringContract, formatSalesReport } from '@/lib/report-formatters';
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
    const [fullReportData, setFullReportData] = useState<FullReportData | null>(null);
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(false);

    const [autoCalcDeposit, setAutoCalcDeposit] = useState(true);
    const [reportOptions, setReportOptions] = useState({
        includeFinancials: true,
        includeBankLedger: true,
        includeSalaries: true,
        includeDutyLogs: true,
        includeInventory: true
    });

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
        setFullReportData(null);
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
            else if (reportType === 'Full Shop Report') {
                const isValid = await reportForm.trigger();
                if (!isValid) throw new Error("Please correct date errors.");
                const data = reportForm.getValues();
                const result = await generateFullShopReportData(new Date(data.startDate), new Date(data.endDate));
                if (!result.success || !result.data) throw new Error(result.error || 'Failed to fetch shop data');
                
                setFullReportData(result.data);
                
                // Text representation for Discord/Clipboard
                reportText = `KOI CAFE - FULL SHOP REPORT\n` +
                             `Period: ${new Date(result.data.startDate).toLocaleDateString()} - ${new Date(result.data.endDate).toLocaleDateString()}\n` +
                             `---------------------------\n` +
                             `Opening: $${result.data.financials.openingBalance.toLocaleString()}\n` +
                             `Closing: $${result.data.financials.closingBalance.toLocaleString()}\n` +
                             `Net Profit: $${result.data.financials.netProfit.toLocaleString()}\n` +
                             `---------------------------\n` +
                             `Total Employees: ${result.data.hr.totalEmployees}\n` +
                             `Hired: ${result.data.hr.membersAdded}`;
            }
            else if (reportType === 'Sales Report') {
                const isValid = await reportForm.trigger();
                if (!isValid) throw new Error("Please correct date errors.");
                const data = reportForm.getValues();
                const result = await generateSalesReportData(new Date(data.startDate), new Date(data.endDate));
                if (!result.success || !result.data) throw new Error(result.error || 'Failed to fetch sales data');
                
                reportText = formatSalesReport(result.data, reportTo, reportFrom, result.data.aiAnalysis);
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

    const handleDownloadPDF = async () => {
        if (!fullReportData) return;
        try {
            await generateShopPDF(fullReportData, reportTo, reportFrom, reportOptions);
            toast({ title: "Success", description: "PDF generated and downloading." });
        } catch (error: any) {
            toast({ variant: "destructive", title: "PDF Error", description: error.message });
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
                                    <SelectItem value="Sales Report">AI Sales Report</SelectItem>
                                    <SelectItem value="Full Shop Report">Detailed Overall Report (PDF)</SelectItem>
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

                    {(reportType === 'Weekly' || reportType === 'Monthly' || reportType === 'Sales Report' || reportType === 'Full Shop Report') && (
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
                            
                            {reportType === 'Full Shop Report' && (
                                <div className="space-y-3 bg-black/20 p-4 rounded-lg border border-white/5">
                                    <Label className="text-accent">Include Sections in PDF</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="inc-fin" 
                                                checked={reportOptions.includeFinancials} 
                                                onCheckedChange={(checked) => setReportOptions(prev => ({ ...prev, includeFinancials: !!checked }))}
                                            />
                                            <Label htmlFor="inc-fin" className="text-xs cursor-pointer">Financial Summary</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="inc-bank" 
                                                checked={reportOptions.includeBankLedger} 
                                                onCheckedChange={(checked) => setReportOptions(prev => ({ ...prev, includeBankLedger: !!checked }))}
                                            />
                                            <Label htmlFor="inc-bank" className="text-xs cursor-pointer">Detailed Bank Ledger</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="inc-sal" 
                                                checked={reportOptions.includeSalaries} 
                                                onCheckedChange={(checked) => setReportOptions(prev => ({ ...prev, includeSalaries: !!checked }))}
                                            />
                                            <Label htmlFor="inc-sal" className="text-xs cursor-pointer">Salary Payouts</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="inc-duty" 
                                                checked={reportOptions.includeDutyLogs} 
                                                onCheckedChange={(checked) => setReportOptions(prev => ({ ...prev, includeDutyLogs: !!checked }))}
                                            />
                                            <Label htmlFor="inc-duty" className="text-xs cursor-pointer">Staff Activity (Duty Logs)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="inc-inv" 
                                                checked={reportOptions.includeInventory} 
                                                onCheckedChange={(checked) => setReportOptions(prev => ({ ...prev, includeInventory: !!checked }))}
                                            />
                                            <Label htmlFor="inc-inv" className="text-xs cursor-pointer">Inventory Snapshot</Label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {reportType !== 'Full Shop Report' && reportType !== 'Sales Report' && (
                                <div className="space-y-2">
                                    <Label>Members Removed</Label>
                                    <Input type="text" placeholder="0" {...reportForm.register('membersRemoved')} className="glass-input" />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                        <div className="space-y-2">
                            <Label>{reportType === 'Citizen Contract' || reportType === 'Event Order Contract' ? 'Service Provider Rep' : 'From'}</Label>
                            <Input placeholder={reportType === 'Citizen Contract' ? 'GM | Name' : 'GM Member name'} value={reportFrom} onChange={(e) => setReportFrom(e.target.value)} className="glass-input" />
                        </div>
                        <div className="space-y-2">
                            <Label>{reportType === 'Citizen Contract' || reportType === 'Event Order Contract' || reportType === 'Recurring Contract' ? 'Client Organization / Name' : 'To'}</Label>
                            <Input placeholder={reportType === 'Citizen Contract' ? 'Client Name' : 'Client Organization / Name'} value={reportTo} onChange={(e) => setReportTo(e.target.value)} className="glass-input" />
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
                        {reportType === 'Full Shop Report' && fullReportData && (
                            <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="bg-green-600/20 hover:bg-green-600/40 text-green-400 border-green-600/50">
                                <FileText className="w-4 h-4 mr-2" /> Download PDF
                            </Button>
                        )}
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

