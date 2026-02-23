'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export function ApplicationForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            realName: formData.get('realName'),
            cityName: formData.get('cityName'),
            affiliations: formData.get('affiliations'),
            experience: formData.get('experience'),
            agreement: formData.get('agreement'),
        };

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

            toast.success('Your application has been submitted successfully! We will review it shortly.');
            router.push('/'); // Or a success page
        } catch (error: any) {
            console.error('Submission Error:', error);
            toast.error(error.message || 'An error occurred while submitting your application.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl"
        >
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold uppercase tracking-tight text-white mb-2">Recruitment Application</h1>
                <p className="text-muted-foreground">Join the elite. Fill out the form below to apply.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="realName" className="text-sm font-medium text-white/80">Real Name</label>
                    <Input id="realName" name="realName" placeholder="Your Real Name" required className="bg-black/50 border-white/20 text-white placeholder:text-white/30" maxLength={50} />
                </div>

                <div className="space-y-2">
                    <label htmlFor="cityName" className="text-sm font-medium text-white/80">City Name</label>
                    <Input id="cityName" name="cityName" placeholder="Your In-Game Name" required className="bg-black/50 border-white/20 text-white placeholder:text-white/30" maxLength={50} />
                </div>

                <div className="space-y-2">
                    <label htmlFor="affiliations" className="text-sm font-medium text-white/80">Current Affiliations</label>
                    <Input id="affiliations" name="affiliations" placeholder="Gang / XPD / XMD / Club (or None)" required className="bg-black/50 border-white/20 text-white placeholder:text-white/30" maxLength={100} />
                </div>

                <div className="space-y-2">
                    <label htmlFor="experience" className="text-sm font-medium text-white/80">Motivation & Experience</label>
                    <Textarea id="experience" name="experience" placeholder="Why do you want to join? List your previous RP experience and active hours." required className="min-h-[120px] bg-black/50 border-white/20 text-white placeholder:text-white/30" maxLength={1000} />
                </div>

                <div className="space-y-2">
                    <label htmlFor="agreement" className="text-sm font-medium text-white/80">Do you agree to work in a Restaurant RP?</label>
                    <Input id="agreement" name="agreement" placeholder="Type 'Yes' to acknowledge hierarchy & rules." required className="bg-black/50 border-white/20 text-white placeholder:text-white/30" maxLength={50} />
                </div>

                <Button type="submit" className="w-full py-6 text-lg font-bold bg-accent text-white hover:bg-accent/80 transition-all rounded-lg" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit Application'}
                </Button>
            </form>
        </motion.div>
    );
}
