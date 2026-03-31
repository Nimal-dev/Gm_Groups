'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { submitRawRequest } from '@/actions/rawRequest';
import { Box, User, Building2, AlertCircle, Receipt, MessageSquare, CalendarClock, CheckCircle2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const RawRequestSchema = z.object({
    ingameName: z.string().min(1, "In-game name is required"),
    partner: z.string().min(1, "Partner is required"),
    urgency: z.string().min(1, "Urgency is required"),
    items: z.string().min(5, "Please specify items and quantities"),
    datetime: z.string().min(1, "Needed by date & time is required"),
    notes: z.string().optional()
});

type RawRequestFormValues = z.infer<typeof RawRequestSchema>;

export default function RawRequestPage() {
    const { toast } = useToast();
    const [success, setSuccess] = useState(false);

    const form = useForm<RawRequestFormValues>({
        resolver: zodResolver(RawRequestSchema),
        defaultValues: {
            ingameName: '',
            partner: '',
            urgency: '',
            items: '',
            datetime: '',
            notes: ''
        }
    });

    const isSubmitting = form.formState.isSubmitting;

    const onSubmit = async (data: RawRequestFormValues) => {
        const result = await submitRawRequest(data);

        if (result.success) {
            setSuccess(true);
            toast({
                title: "Request Submitted!",
                description: "Your materials request has been forwarded seamlessly.",
                className: "bg-green-600 text-white border-green-700",
            });
            form.reset();
        } else {
            toast({
                title: "Submission Failed",
                description: result.error || "An error occurred",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            <Header />

            <main className="flex-grow flex items-center justify-center py-24 px-4 relative z-10 w-full">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-2xl mt-10 md:mt-4"
                >
                    <Card className="glass-card border-white/10 overflow-hidden shadow-2xl bg-black/40 backdrop-blur-xl rounded-2xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                        <CardHeader className="text-center pb-6 pt-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                                className="mx-auto bg-white/5 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                            >
                                <Box className="w-10 h-10 text-blue-400" />
                            </motion.div>
                            <CardTitle className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-blue-300">
                                Raw Materials Request
                            </CardTitle>
                            <CardDescription className="text-base text-blue-200/70 mt-3 font-medium">
                                Direct material request forms to YKZ and MLB partners.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="px-6 pb-8 md:px-10">
                            <AnimatePresence mode="wait">
                                {success ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="flex flex-col items-center justify-center py-10 text-center"
                                    >
                                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-400 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                                            <CheckCircle2 className="w-12 h-12" />
                                        </div>
                                        <h3 className="text-3xl font-bold text-white mb-3">Request Sourced!</h3>
                                        <p className="text-blue-100/70 max-w-sm mb-8">
                                            Your request has been beamed securely into the partner's automated logistics channel.
                                        </p>
                                        <Button
                                            variant="outline"
                                            className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20 hover:text-white rounded-full px-8 py-6 h-auto transition-all duration-300"
                                            onClick={() => setSuccess(false)}
                                        >
                                            Submit Another Request
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <FormField
                                                        control={form.control}
                                                        name="ingameName"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 text-white/80 font-medium">
                                                                    <User className="w-4 h-4 text-blue-400" /> In-game Name
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="e.g. John Doe"
                                                                        {...field}
                                                                        className="bg-black/30 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/30 text-white placeholder:text-white/20 h-12 rounded-xl"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-red-400" />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="datetime"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 text-white/80 font-medium">
                                                                    <CalendarClock className="w-4 h-4 text-indigo-400" /> Needed By
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="e.g. 15/04/2026 at 5:00 PM"
                                                                        {...field}
                                                                        className="bg-black/30 border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/30 text-white placeholder:text-white/20 h-12 rounded-xl"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-red-400" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <FormField
                                                        control={form.control}
                                                        name="partner"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 text-white/80 font-medium">
                                                                    <Building2 className="w-4 h-4 text-purple-400" /> Select Partner
                                                                </FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="bg-black/30 border-white/10 focus:ring-purple-500/30 h-12 text-white rounded-xl">
                                                                            <SelectValue placeholder="Target Source" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent className="bg-black/90 border-white/10 text-white shadow-xl backdrop-blur-xl rounded-xl">
                                                                        <SelectItem className="focus:bg-white/10 focus:text-white cursor-pointer" value="YKZ">YKZ</SelectItem>
                                                                        <SelectItem className="focus:bg-white/10 focus:text-white cursor-pointer" value="MLB">MLB</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage className="text-red-400" />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="urgency"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 text-white/80 font-medium">
                                                                    <AlertCircle className="w-4 h-4 text-red-400" /> Urgency Level
                                                                </FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="bg-black/30 border-white/10 focus:ring-red-500/30 h-12 text-white rounded-xl">
                                                                            <SelectValue placeholder="Select Threat/Urgency" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent className="bg-black/90 border-white/10 text-white shadow-xl backdrop-blur-xl rounded-xl">
                                                                        <SelectItem className="focus:bg-white/10 focus:text-red-400 cursor-pointer" value="URGENT">🔴 Urgent</SelectItem>
                                                                        <SelectItem className="focus:bg-white/10 focus:text-yellow-400 cursor-pointer" value="INTERMEDIATE">🟡 Intermediate</SelectItem>
                                                                        <SelectItem className="focus:bg-white/10 focus:text-green-400 cursor-pointer" value="CASUAL">🟢 Casual</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage className="text-red-400" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <FormField
                                                    control={form.control}
                                                    name="items"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 text-white/80 font-medium">
                                                                <Receipt className="w-4 h-4 text-pink-400" /> Items & Quantity
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="e.g. 500x Steel, 200x Glass"
                                                                    {...field}
                                                                    className="bg-black/30 border-white/10 focus:border-pink-500/50 focus:ring-pink-500/30 text-white placeholder:text-white/20 min-h-[100px] resize-none rounded-xl"
                                                                />
                                                            </FormControl>
                                                            <FormMessage className="text-red-400" />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="notes"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 text-white/80 font-medium">
                                                                <MessageSquare className="w-4 h-4 text-gray-400" /> Additional Notes
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="Special instructions or optional context..."
                                                                    {...field}
                                                                    className="bg-black/30 border-white/10 focus:border-gray-500/50 focus:ring-gray-500/30 text-white placeholder:text-white/20 min-h-[80px] resize-none rounded-xl"
                                                                />
                                                            </FormControl>
                                                            <FormMessage className="text-red-400" />
                                                        </FormItem>
                                                    )}
                                                />

                                                <motion.div
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                    className="pt-2"
                                                >
                                                    <Button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white border-0 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-all duration-300 rounded-xl"
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                                                Broadcasting...
                                                            </>
                                                        ) : 'Send Request Log'}
                                                    </Button>
                                                </motion.div>
                                            </form>
                                        </Form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
