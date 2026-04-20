'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InputOTPProps {
    value: string;
    onChange: (value: string) => void;
    maxLength?: number;
    disabled?: boolean;
    className?: string;
}

export function InputOTP({ 
    value, 
    onChange, 
    maxLength = 4, 
    disabled,
    className 
}: InputOTPProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = React.useState(false);

    const handleClick = () => {
        inputRef.current?.focus();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value.replace(/[^0-9]/g, '').slice(0, maxLength);
        onChange(newValue);
    };

    const slots = Array.from({ length: maxLength });

    return (
        <div 
            className={cn("relative flex items-center justify-center gap-3 cursor-text", className)}
            onClick={handleClick}
        >
            <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                value={value}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={disabled}
                className="absolute inset-0 opacity-0 cursor-default"
                maxLength={maxLength}
            />
            
            {slots.map((_, index) => {
                const char = value[index];
                const isActive = isFocused && (index === value.length || (index === maxLength - 1 && value.length === maxLength));
                const isFilled = !!char;

                return (
                    <div
                        key={index}
                        className={cn(
                            "relative w-12 h-14 rounded-xl border flex items-center justify-center transition-all duration-300",
                            "bg-white/[0.07] backdrop-blur-xl", // Increased white shade
                            isActive 
                                ? "border-accent ring-2 ring-accent/20 shadow-[0_0_15px_rgba(124,58,237,0.3)]" 
                                : isFilled 
                                    ? "border-white/40 bg-white/[0.12]" // Much more visible when filled
                                    : "border-white/20", // More visible default
                            disabled && "opacity-50"
                        )}
                    >
                        <AnimatePresence mode="wait">
                            {char ? (
                                <motion.div
                                    key="char"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    className="flex items-center justify-center"
                                >
                                    {/* Masked dot for PIN security */}
                                    <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                                </motion.div>
                            ) : (
                                isActive && (
                                    <motion.div
                                        key="cursor"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="w-0.5 h-6 bg-accent rounded-full"
                                    />
                                )
                            )}
                        </AnimatePresence>
                        
                        {/* Glass reflection effect */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                    </div>
                );
            })}
        </div>
    );
}
