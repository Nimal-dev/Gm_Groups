'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { submitCateringRequest, getOrgMembers } from '@/actions/cateringRequest';
import { Receipt, Calendar as CalendarIcon, Clock, User, Building2, UtensilsCrossed, CheckCircle2, Loader2 } from 'lucide-react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// ... (existing imports)

const CateringSchema = z.object({
    orgName: z.string().min(1, "Organization name is required"),
    repName: z.string().min(1, "Representative name is required"),
    eventDate: z.date({ required_error: "Event date is required" }),
    eventTime: z.string().min(1, "Event time is required"),
    items: z.string().min(10, "Please list items (min 10 characters)"),
    club: z.string().optional(),
    policyAccepted: z.boolean().refine(val => val === true, {
        message: "You must accept the Bulk Order Policy to continue."
    })
});

type CateringFormValues = z.infer<typeof CateringSchema>;

export default function CateringRequestPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { toast } = useToast();
    const [success, setSuccess] = useState(false);
    const [members, setMembers] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            toast({ title: "Login Required", description: "You must be logged in to submit a request.", variant: "destructive" });
            router.push('/login?callbackUrl=/catering-request');
        }
    }, [status, router, toast]);

    const form = useForm<CateringFormValues>({
        resolver: zodResolver(CateringSchema),
        defaultValues: {
            orgName: '',
            repName: '',
            eventTime: '',
            items: '',
            club: '',
            policyAccepted: false
        }
    });

    if (status === 'loading') {
        return <div className="flex items-center justify-center min-h-screen bg-black text-white"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    if (!session) return null; // Prevent flash of content

    const isSubmitting = form.formState.isSubmitting;

    const handleOrgChange = async (value: string) => {
        let clubVal = '';
        if (value === 'Scorp Events') clubVal = 'SCORP';
        else if (value === 'BM Events') clubVal = 'BM';

        form.setValue('orgName', value);
        form.setValue('club', clubVal);
        form.setValue('repName', ''); // Reset rep when org changes

        // Fetch members
        const result = await getOrgMembers(value);
        setMembers(result.members);
    };

    const onSubmit = async (data: CateringFormValues) => {
        const submissionData = {
            ...data,
            club: data.club || '',
            eventDateStr: format(data.eventDate, "dd/MM/yyyy"), // Convert date for backend
        };

        const result = await submitCateringRequest(submissionData);

        if (result.success) {
            setSuccess(true);
            toast({
                title: "Request Submitted!",
                description: "Your catering request has been sent to our team for approval.",
                className: "bg-green-600 text-white border-green-700",
            });
            form.reset();
        } else {
            toast({
                title: "Submission Failed",
                description: result.error,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[100px]" />
            </div>

            <Header />

            <main className="flex-grow flex items-center justify-center py-20 px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-3xl"
                >
                    <Card className="glass-card border-white/10 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-red-500" />

                        <CardHeader className="text-center pb-8 pt-10">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="mx-auto bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20 shadow-neon"
                            >
                                <UtensilsCrossed className="w-8 h-8 text-orange-400" />
                            </motion.div>
                            <CardTitle className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                                Event Bulk Catering Request
                            </CardTitle>
                            <CardDescription className="text-lg text-muted-foreground mt-2">
                                Book your major event catering with GM Groups.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-12 text-center"
                                >
                                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-400">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Request Received!</h3>
                                    <p className="text-muted-foreground max-w-md">
                                        Our team is reviewing your catering request. You will be contacted shortly for confirmation.
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="mt-8 border-white/20 hover:bg-white/10"
                                        onClick={() => setSuccess(false)}
                                    >
                                        Submit Another Request
                                    </Button>
                                </motion.div>
                            ) : (
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="orgName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2 text-white/80">
                                                            <Building2 className="w-4 h-4 text-orange-400" /> Organization Name
                                                        </FormLabel>
                                                        <Select onValueChange={(val) => handleOrgChange(val)} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="bg-black/20 border-white/10 focus:ring-orange-500/20 h-12 text-white">
                                                                    <SelectValue placeholder="Select Organization" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="bg-black/90 border-white/10 text-white">
                                                                <SelectItem value="Scorp Events">Scorp Events</SelectItem>
                                                                <SelectItem value="BM Events">BM Events</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="repName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2 text-white/80">
                                                            <User className="w-4 h-4 text-yellow-400" /> Representative Name
                                                        </FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value} disabled={!form.getValues('orgName')}>
                                                            <FormControl>
                                                                <SelectTrigger className="bg-black/20 border-white/10 focus:ring-yellow-500/20 h-12 text-white disabled:opacity-50">
                                                                    <SelectValue placeholder={form.getValues('orgName') ? "Select Representative" : "Select Organization First"} />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="bg-black/90 border-white/10 text-white max-h-[200px]">
                                                                {members.length > 0 ? (
                                                                    members.map(member => (
                                                                        <SelectItem key={member.id} value={`${member.name} (<@${member.id}>)`}>
                                                                            {member.name}
                                                                        </SelectItem>
                                                                    ))
                                                                ) : (
                                                                    <SelectItem value="none" disabled>No members found</SelectItem>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="eventDate"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel className="flex items-center gap-2 text-white/80">
                                                            <CalendarIcon className="w-4 h-4 text-blue-400" /> Event Date
                                                        </FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant={"outline"}
                                                                        className={cn(
                                                                            "w-full h-12 bg-black/20 border-white/10 text-left font-normal text-white hover:bg-black/30 hover:text-white border-white/10",
                                                                            !field.value && "text-muted-foreground"
                                                                        )}
                                                                    >
                                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0 bg-black/90 border-white/20 text-white backdrop-blur-xl" align="start">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={field.value}
                                                                    onSelect={field.onChange}
                                                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                                    initialFocus
                                                                    className="bg-transparent"
                                                                    classNames={{
                                                                        day_selected: "bg-blue-600 text-white hover:bg-blue-600 focus:bg-blue-600",
                                                                        day_today: "bg-white/10 text-white",
                                                                        day: "text-white hover:bg-white/20 rounded-md transition-colors",
                                                                        caption_label: "text-white",
                                                                        nav_button: "text-white hover:bg-white/20",
                                                                    }}
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="eventTime"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2 text-white/80">
                                                            <Clock className="w-4 h-4 text-purple-400" /> Event Time
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="e.g. 18:00 or 6 PM"
                                                                {...field}
                                                                className="bg-black/20 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder:text-white/20 h-12"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="items"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2 text-white/80">
                                                        <Receipt className="w-4 h-4 text-pink-400" /> Items & Quantity
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="List the items you need..."
                                                            {...field}
                                                            className="bg-black/20 border-white/10 focus:border-pink-500/50 focus:ring-pink-500/20 text-white placeholder:text-white/20 min-h-[150px] resize-none"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="space-y-4 pt-4 border-t border-white/10">
                                            <Label className="flex items-center gap-2 text-white/80">
                                                <Receipt className="w-4 h-4 text-purple-400" /> Bulk Order Policy
                                            </Label>
                                            <ScrollArea className="h-[300px] w-full rounded-md border border-white/10 bg-black/40 p-4 text-sm text-white/70">
                                                <div className="space-y-4">
                                                    <h4 className="font-bold text-white">GM BURGERSHOT: BULK ORDER POLICY</h4>
                                                    <p>To ensure operational efficiency and the highest standard of service, the following protocols apply to all bulk procurements.</p>

                                                    {/* ... (Policy content remains the same, just rendering static text) ... */}
                                                    <div>
                                                        <h5 className="font-semibold text-white/90">1. QUANTITY & VALUE THRESHOLDS</h5>
                                                        <ul className="list-disc pl-4 space-y-1">
                                                            <li><strong>Definition of Unit:</strong> A "Unit" is defined as a Main Entrée (Burger/Sandwich) or Premium Side.</li>
                                                            <li><strong>Minimum Order:</strong> 100 Qualifying Units OR a Minimum Order Value (MOV) of $5,000,000.</li>
                                                            <li><strong>Maximum Order:</strong> 500 Qualifying Units per batch. Orders exceeding 500 units require distinct negotiation with GM Management (10-day lead time).</li>
                                                        </ul>
                                                    </div>

                                                    <div>
                                                        <h5 className="font-semibold text-white/90">2. SCHEDULING & LEAD TIMES</h5>
                                                        <ul className="list-disc pl-4 space-y-1">
                                                            <li><strong>Booking Lead Time:</strong> Min. 5 Business Days prior to Collection Date.</li>
                                                            <li><strong>Confirmation:</strong> Order is confirmed ONLY AFTER the catering agreement is signed. Verbal/Text agreements are not binding.</li>
                                                            <li><strong>"Day-Prior" Rule:</strong> Collections must be scheduled one (1) day prior to the event.</li>
                                                            <li><strong>Cool-Down:</strong> X-Club limited to one (1) bulk order every 72 hours.</li>
                                                        </ul>
                                                    </div>

                                                    <div>
                                                        <h5 className="font-semibold text-white/90">3. FINANCIAL OBLIGATIONS</h5>
                                                        <ul className="list-disc pl-4 space-y-1">
                                                            <li><strong>Deposit:</strong> 50% Non-Refundable Deposit upon signing.</li>
                                                            <li><strong>Final Settlement:</strong> Remaining 50% due 24 hours prior to collection. Goods released only after full payment.</li>
                                                            <li><strong>Cancellations:</strong> &lt;4 Days Notice = Deposit forfeited. &lt;48 Hours Notice = 100% Invoice due.</li>
                                                        </ul>
                                                    </div>

                                                    <div>
                                                        <h5 className="font-semibold text-white/90">4. LATE BOOKINGS & SURCHARGES</h5>
                                                        <ul className="list-disc pl-4 space-y-1">
                                                            <li><strong>Tier 1 (3-4 Days Prior):</strong> 15% Surcharge.</li>
                                                            <li><strong>Tier 2 (24-48 Hours):</strong> 35% Rush Fee.</li>
                                                            <li><strong>Tier 3 (&lt;24 Hours):</strong> 3x Total Invoice</li>
                                                        </ul>
                                                    </div>

                                                    <div>
                                                        <h5 className="font-semibold text-white/90">5. LIABILITY & WAIVER</h5>
                                                        <p>Liability transfers to X-Club upon handover. X-Club assumes responsibility for cold chain storage (&lt;5°C) and safe reheating (&gt;75°C). X-Club indemnifies GM Burgershot against health claims for food consumed &gt;32 hours after handover or improperly stored. The foods can be consumed till 1% durability. Any foods consumed &lt;1% is strictly forbidden and will not come under burgershot’s responsibility.</p>
                                                    </div>
                                                    <div>
                                                        <h5 className="font-semibold text-white/90">6.POLICY GOVERNANCE & AMENDMENTS</h5>
                                                        <ul className="list-disc pl-4 space-y-1">
                                                            <li><strong>Right to Modify:</strong> GM Burgershot reserves the right to review, amend, or update this policy at any time, specifically in the event that operational flaws, loopholes, or financial discrepancies are identified.
                                                            </li>
                                                            <li><strong>Notification:</strong> Any such amendments will be effective immediately upon written notification to the Client. Continued use of GM Burgershot’s catering services constitutes acceptance of the revised terms.
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </ScrollArea>

                                            <FormField
                                                control={form.control}
                                                name="policyAccepted"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-white/10 p-4">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                                className="border-white/20 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                                            />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white/80">
                                                                I confirm I have read and accept the Bulk Order Policy.
                                                            </FormLabel>
                                                            <FormMessage />
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:via-red-700 hover:to-pink-700 text-white border-0 shadow-neon transition-all duration-300 mt-4"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Calculating Estimate...
                                                </>
                                            ) : 'Submit Quote Request'}
                                        </Button>
                                    </form>
                                </Form>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
