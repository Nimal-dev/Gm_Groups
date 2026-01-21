"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function ClosureModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Open the modal automatically when the component mounts
        setIsOpen(true);
    }, []);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[500px] p-0 border-none bg-transparent shadow-none overflow-hidden [&>button]:hidden">
                {/* Animated Gradient Border/Background Container */}
                <div className="relative rounded-xl p-[2px] overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 animate-gradient-xy opacity-75 blur-sm transition-opacity duration-500 group-hover:opacity-100" />

                    {/* Main Content Card */}
                    <div className="relative bg-black/80 backdrop-blur-xl rounded-xl p-6 sm:p-8 border border-white/10 shadow-2xl">
                        {/* Close Button Override */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute right-4 top-4 rounded-full p-2 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>

                        <DialogHeader>
                            <DialogTitle className="text-2xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 text-center mb-6">
                                Farewell
                            </DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-6">
                            <div className="space-y-4 text-center">
                                <p className="text-sm md:text-base leading-relaxed text-white/80 font-light tracking-wide">
                                    It is with a heavy heart that we announce the closing of <span className="text-white font-medium">Burgershot</span> on <span className="text-red-400">January 31st</span>. Following this date, the establishment will be put up for auction.
                                </p>

                                <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto my-6" />

                                <p className="text-sm md:text-base leading-relaxed text-white/70 font-light tracking-wide italic">
                                    "We want to extend our deepest gratitude to everyone who has been part of this journey. It is truly heartbreaking that we never even had the chance to properly inaugurate this business. We poured everything we had into solving the issues and holding on until the end of our contract, but sadly, our best efforts were not enough."
                                </p>
                            </div>

                            <div className="flex justify-center mt-4">
                                <Button
                                    onClick={() => setIsOpen(false)}
                                    variant="outline"
                                    className="border-white/20 hover:bg-white/10 hover:text-white text-white/70 transition-all duration-300 rounded-full px-8"
                                >
                                    Close Message
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
