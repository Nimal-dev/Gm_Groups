'use client';

import { useState } from 'react';
import { ITEM_CATEGORIES } from '@/constants/foodItems';
import { submitPreparedFoodLog } from '@/actions/preparedFood';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Minus, Send, Trash2, UtensilsCrossed } from 'lucide-react';

export function FoodLogForm() {
    const { toast } = useToast();
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState(Object.keys(ITEM_CATEGORIES)[0]);

    const handleQuantityChange = (item: string, value: number) => {
        setQuantities(prev => {
            const newVal = Math.max(0, value);
            if (newVal === 0) {
                const { [item]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [item]: newVal };
        });
    };

    const adjustQuantity = (item: string, delta: number) => {
        setQuantities(prev => {
            const current = prev[item] || 0;
            const newVal = Math.max(0, current + delta);
            if (newVal === 0) {
                const { [item]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [item]: newVal };
        });
    };

    const handleClear = () => {
        if (confirm('Are you sure you want to clear all items?')) {
            setQuantities({});
        }
    };

    const handleSubmit = async () => {
        const itemsToSubmit = Object.entries(quantities).reduce((acc, [key, val]) => {
            if (val > 0) acc[key] = val;
            return acc;
        }, {} as Record<string, number>);

        if (Object.keys(itemsToSubmit).length === 0) {
            toast({ title: 'Empty Log', description: 'Please add at least one item.', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await submitPreparedFoodLog(itemsToSubmit);
            if (res.success) {
                toast({
                    title: 'Log Submitted',
                    description: res.message || 'Attached to Discord log.',
                    className: 'bg-green-600 border-none text-white'
                });
                setQuantities({});
            } else {
                toast({ title: 'Error', description: res.error, variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Unexpected error occurred.', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl">
            {/* Left Column: Form */}
            <div className="lg:col-span-2">
                <Card className="glass-card w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UtensilsCrossed className="w-6 h-6 text-accent" />
                            Prepared Food Log
                        </CardTitle>
                        <CardDescription>
                            Select items below to log your preparation work.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                            <div className="overflow-x-auto pb-4">
                                <TabsList className="bg-transparent p-0 h-auto flex gap-2 w-max">
                                    {Object.entries(ITEM_CATEGORIES).map(([key, cat]) => (
                                        <TabsTrigger
                                            key={key}
                                            value={key}
                                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-white/10"
                                        >
                                            {cat.label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>

                            {Object.entries(ITEM_CATEGORIES).map(([key, cat]) => (
                                <TabsContent key={key} value={key} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {cat.items.map(item => (
                                            <div key={item} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                                <span className="font-medium text-sm truncate pr-2" title={item}>{item}</span>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full border-white/20 bg-transparent hover:bg-white/20"
                                                        onClick={() => adjustQuantity(item, -1)}
                                                        disabled={!quantities[item]}
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </Button>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={quantities[item] || ''}
                                                        onChange={(e) => handleQuantityChange(item, parseInt(e.target.value) || 0)}
                                                        className="w-14 h-8 text-center bg-transparent border-white/20 p-0"
                                                        placeholder="0"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full border-white/20 bg-transparent hover:bg-white/20"
                                                        onClick={() => adjustQuantity(item, 1)}
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
                        <div className="text-sm text-muted-foreground">
                            Total Items Selected: <span className="text-white font-bold">{totalItems}</span>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {totalItems > 0 && (
                                <Button variant="ghost" onClick={handleClear} className="text-muted-foreground hover:text-red-400">
                                    <Trash2 className="w-4 h-4 mr-2" /> Clear
                                </Button>
                            )}
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || totalItems === 0}
                                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" /> Submit Log
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Right Column: Instructions */}
            <div className="lg:col-span-1">
                <Card className="glass-card sticky top-6">
                    <CardHeader>
                        <CardTitle className="text-lg">How to Log Food</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <div className="flex gap-3">
                            <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</div>
                            <p>Select a category tab (e.g., "Food Items", "Fresh & Sliced").</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</div>
                            <p>Use the <span className="text-white font-mono">+</span> and <span className="text-white font-mono">-</span> buttons to adjust quantities for prepared items.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</div>
                            <p>You can switch tabs and add items from multiple categories before submitting.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">4</div>
                            <p>Click <span className="text-green-400 font-bold">Submit Log</span> to save directly to the database and Discord.</p>
                        </div>

                        <div className="mt-6 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs">
                            <p className="font-bold mb-1">Important:</p>
                            Only log items you have personally prepared or sliced. This data is used for staff leaderboards.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
