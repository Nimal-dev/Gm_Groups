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
import { Receipt, Calendar as CalendarIcon, Clock, User, Building2, Package, CheckCircle2, Loader2, UtensilsCrossed } from 'lucide-react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function CateringRequestPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [date, setDate] = useState<Date>();
    const [members, setMembers] = useState<{ id: string, name: string }[]>([]);
    const [policyAccepted, setPolicyAccepted] = useState(false);

    const [formData, setFormData] = useState({
        orgName: '',
        repName: '',
        eventDateStr: '', // DD/MM/YYYY
        eventTime: '',
        items: '',
        club: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = async (value: string) => {
        let clubVal = '';
        if (value === 'Scorp Events') clubVal = 'SCORP';
        else if (value === 'BM Events') clubVal = 'BM';

        setFormData(prev => ({
            ...prev,
            orgName: value,
            club: clubVal,
            repName: ''
        }));

        const result = await getOrgMembers(value);
        setMembers(result.members);
    };

    const handleRepChange = (value: string) => {
        setFormData(prev => ({ ...prev, repName: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!policyAccepted) {
            toast({
                title: "Policy Acceptance Required",
                description: "You must read and accept the Bulk Order Policy to submit.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        const result = await submitCateringRequest(formData);

        setLoading(false);

        if (result.success) {
            setSuccess(true);
            toast({
                title: "Request Submitted!",
                description: "Your catering request has been sent to our team for approval.",
                className: "bg-green-600 text-white border-green-700",
            });
            setFormData({ orgName: '', repName: '', eventDateStr: '', eventTime: '', items: '', club: '' });
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
                                Catering Request
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
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="orgName" className="flex items-center gap-2 text-white/80">
                                                <Building2 className="w-4 h-4 text-orange-400" /> Organization Name
                                            </Label>
                                            <Select name="orgName" onValueChange={handleSelectChange}>
                                                <SelectTrigger className="bg-black/20 border-white/10 focus:ring-orange-500/20 h-12 text-white">
                                                    <SelectValue placeholder="Select Organization" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-black/90 border-white/10 text-white">
                                                    <SelectItem value="Scorp Events">Scorp Events</SelectItem>
                                                    <SelectItem value="BM Events">BM Events</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="repName" className="flex items-center gap-2 text-white/80">
                                                <User className="w-4 h-4 text-yellow-400" /> Representative Name
                                            </Label>
                                            <Select name="repName" value={formData.repName} onValueChange={handleRepChange} disabled={!formData.orgName}>
                                                <SelectTrigger className="bg-black/20 border-white/10 focus:ring-yellow-500/20 h-12 text-white disabled:opacity-50">
                                                    <SelectValue placeholder={formData.orgName ? "Select Representative" : "Select Organization First"} />
                                                </SelectTrigger>
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
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 flex flex-col">
                                            <Label htmlFor="eventDateStr" className="flex items-center gap-2 text-white/80">
                                                <CalendarIcon className="w-4 h-4 text-blue-400" /> Event Date
                                            </Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full h-12 bg-black/20 border-white/10 text-left font-normal text-white hover:bg-black/30 hover:text-white border-white/10",
                                                            !date && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 bg-black/90 border-white/20 text-white backdrop-blur-xl" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={date}
                                                        onSelect={(selectedDate) => {
                                                            setDate(selectedDate);
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                eventDateStr: selectedDate ? format(selectedDate, "dd/MM/yyyy") : ""
                                                            }));
                                                        }}
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
                                            <input type="hidden" name="eventDateStr" value={formData.eventDateStr} required />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="eventTime" className="flex items-center gap-2 text-white/80">
                                                <Clock className="w-4 h-4 text-purple-400" /> Event Time
                                            </Label>
                                            <Input
                                                id="eventTime"
                                                name="eventTime"
                                                placeholder="e.g. 18:00 or 6 PM"
                                                required
                                                value={formData.eventTime}
                                                onChange={handleChange}
                                                className="bg-black/20 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder:text-white/20 h-12"
                                            />
                                        </div>
                                    </div>



                                    <div className="space-y-2">
                                        <Label htmlFor="items" className="flex items-center gap-2 text-white/80">
                                            <Receipt className="w-4 h-4 text-pink-400" /> Items & Quantity
                                        </Label>
                                        <Textarea
                                            id="items"
                                            name="items"
                                            placeholder="List the items you need..."
                                            required
                                            value={formData.items}
                                            onChange={handleChange}
                                            className="bg-black/20 border-white/10 focus:border-pink-500/50 focus:ring-pink-500/20 text-white placeholder:text-white/20 min-h-[150px] resize-none"
                                        />
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-white/10">
                                        <Label className="flex items-center gap-2 text-white/80">
                                            <Receipt className="w-4 h-4 text-purple-400" /> Bulk Order & Catering Policy
                                        </Label>

                                        <ScrollArea className="h-[300px] w-full rounded-md border border-white/10 bg-black/40 p-4 text-sm text-white/70">
                                            <div className="space-y-4">
                                                <h4 className="font-bold text-white">GM BURGERSHOT: BULK ORDER & CATERING POLICY</h4>
                                                <p>To ensure operational efficiency and the highest standard of service, the following protocols apply to all bulk procurements.</p>

                                                <div>
                                                    <h5 className="font-semibold text-white/90">1. QUANTITY & VALUE THRESHOLDS</h5>
                                                    <ul className="list-disc pl-4 space-y-1">
                                                        <li><strong>Definition of Unit:</strong> A "Unit" is defined as a Main Entrée (Burger/Sandwich) or Premium Side. Condiments/beverages do not count.</li>
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
                                                    </ul>
                                                </div>

                                                <div>
                                                    <h5 className="font-semibold text-white/90">5. LIABILITY & WAIVER</h5>
                                                    <p>Liability transfers to X-Club upon handover. X-Club assumes responsibility for cold chain storage (&lt;5°C) and safe reheating (&gt;75°C). X-Club indemnifies GM Burgershot against health claims for food consumed &gt;32 hours after handover or improperly stored.</p>
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

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="policy"
                                                checked={policyAccepted}
                                                onCheckedChange={(checked) => setPolicyAccepted(checked as boolean)}
                                                className="border-white/20 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                            />
                                            <label
                                                htmlFor="policy"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white/80"
                                            >
                                                I confirm I have read and accept the Bulk Order Policy.
                                            </label>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading || !policyAccepted}
                                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:via-red-700 hover:to-pink-700 text-white border-0 shadow-neon transition-all duration-300 mt-4"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Calculating Estimate...
                                            </>
                                        ) : 'Submit Quote Request'}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
