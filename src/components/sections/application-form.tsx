'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, MapPin, Building2, BookHeart, CheckSquare, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const ApplicationSchema = z.object({
    realName: z.string().min(1, "Real name is required").max(50),
    cityName: z.string().min(1, "In-Game name is required").max(50),
    affiliations: z.string().min(1, "Affiliations are required").max(100),
    experience: z.string().min(10, "Please provide more detail about your experience").max(1000),
    agreement: z.string().min(1, "Agreement is required").max(50)
});

type ApplicationFormValues = z.infer<typeof ApplicationSchema>;

export function ApplicationForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [success, setSuccess] = useState(false);

    const form = useForm<ApplicationFormValues>({
        resolver: zodResolver(ApplicationSchema),
        defaultValues: {
            realName: '',
            cityName: '',
            affiliations: '',
            experience: '',
            agreement: ''
        }
    });

    const isSubmitting = form.formState.isSubmitting;

    const onSubmit = async (data: ApplicationFormValues) => {
        try {
            const res = await fetch('/api/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Failed to submit application');
            }

            setSuccess(true);
            toast({
                title: "Application Submitted!",
                description: "Your recruitment file has been successfully sent to High Command.",
                className: "bg-green-600 text-white border-green-700",
            });
            form.reset();
        } catch (error: any) {
            console.error('Submission Error:', error);
            toast({
                title: "Submission Failed",
                description: error.message || 'An error occurred while submitting your application.',
                variant: "destructive",
            });
        }
    };

    return (
        <Card className="glass-card border-white/10 overflow-hidden w-full backdrop-blur-md">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

            <CardHeader className="text-center pb-8 pt-10">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mx-auto bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20 shadow-neon"
                >
                    <ShieldCheck className="w-8 h-8 text-blue-400" />
                </motion.div>
                <CardTitle className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                    Official Recruitment Form
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-2">
                    Submit your application to join the elite ranks of GM Groups.
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
                        <h3 className="text-2xl font-bold text-white mb-2">Application Received!</h3>
                        <p className="text-muted-foreground max-w-md">
                            Your application is now under review by our High Command. You will be notified via Discord regarding your status.
                        </p>
                        <Button
                            variant="outline"
                            className="mt-8 border-white/20 hover:bg-white/10"
                            onClick={() => router.push('/')}
                        >
                            Return Home
                        </Button>
                    </motion.div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="realName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2 text-white/80">
                                                <UserCircle className="w-4 h-4 text-blue-400" /> Real Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Your Real Name"
                                                    {...field}
                                                    className="bg-black/20 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 text-white placeholder:text-white/20 h-12"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="cityName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2 text-white/80">
                                                <MapPin className="w-4 h-4 text-indigo-400" /> City Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Your In-Game Name"
                                                    {...field}
                                                    className="bg-black/20 border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/20 text-white placeholder:text-white/20 h-12"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="affiliations"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-white/80">
                                            <Building2 className="w-4 h-4 text-purple-400" /> Current Affiliations
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Gang / XPD / XMD / Club (or 'None')"
                                                {...field}
                                                className="bg-black/20 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder:text-white/20 h-12"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="experience"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-white/80">
                                            <BookHeart className="w-4 h-4 text-pink-400" /> Motivation & Experience
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Why do you want to join? List your previous RP experience and active hours."
                                                {...field}
                                                className="bg-black/20 border-white/10 focus:border-pink-500/50 focus:ring-pink-500/20 text-white placeholder:text-white/20 min-h-[150px] resize-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="agreement"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-white/80">
                                            <CheckSquare className="w-4 h-4 text-green-400" /> Restaurant RP Agreement
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Type 'Yes' to acknowledge hierarchy & rules."
                                                {...field}
                                                className="bg-black/20 border-white/10 focus:border-green-500/50 focus:ring-green-500/20 text-white placeholder:text-white/20 h-12"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white border-0 shadow-neon transition-all duration-300 mt-8"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Submitting File...
                                    </>
                                ) : 'Submit Application'}
                            </Button>
                        </form>
                    </Form>
                )}
            </CardContent>
        </Card>
    );
}
