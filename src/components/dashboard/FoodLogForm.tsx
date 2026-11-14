'use client';

import { useState, useEffect } from 'react';
import { ITEM_CATEGORIES, BATCH_SIZES } from '@/constants/foodItems';
import { submitPreparedFoodLog } from '@/actions/preparedFood';
import { getMenuAndIngredients } from '@/actions/menu-management';
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
    
    // Dynamic Categories and Batch Sizes
    const [categories, setCategories] = useState<Record<string, { label: string; items: string[] }>>(ITEM_CATEGORIES);
    const [batchSizes, setBatchSizes] = useState<Record<string, number>>(BATCH_SIZES);
    const [activeTab, setActiveTab] = useState(Object.keys(ITEM_CATEGORIES)[0]);

    useEffect(() => {
        getMenuAndIngredients().then((res) => {
            if (res.success && res.menuItems?.length > 0) {
                const newCats: Record<string, { label: string; items: string[] }> = {};
                const newBatches: Record<string, number> = {};

                res.menuItems.forEach((item: any) => {
                    const isDrink = item.category === 'Beverages' || item.type === 'Beverage';
                    const catKey = isDrink ? 'drinks' : 'food_items';
                    const catLabel = isDrink ? '🍹 Drinks & Beverages' : '🍔 Food Items';

                    if (!newCats[catKey]) {
                        newCats[catKey] = { label: catLabel, items: [] };
                    }
                    if (!newCats[catKey].items.includes(item.name)) {
                        newCats[catKey].items.push(item.name);
                    }
                    newBatches[item.name] = item.batchSize || 1;
                });

                setCategories(newCats);
                setBatchSizes(newBatches);
                setActiveTab(prev => newCats[prev] ? prev : Object.keys(newCats)[0]);
            }
        }).catch(err => console.error("Failed to load dynamic food items:", err));
    }, []);

    const handleQuantityChange = (item: string, value: number) => {
        const batchSize = batchSizes[item] || 1;
        // Snap the manually typed value to the nearest multiple of batchSize
        const snappedValue = Math.max(0, Math.round(value / batchSize) * batchSize);
        
        setQuantities(prev => {
            if (snappedValue === 0) {
                const { [item]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [item]: snappedValue };
        });
    };

    const adjustQuantity = (item: string, delta: number) => {
        const batchSize = batchSizes[item] || 1;
        setQuantities(prev => {
            const current = prev[item] || 0;
            const newVal = Math.max(0, current + (delta * batchSize));
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
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
                                    {Object.entries(categories).map(([key, cat]) => (
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

                            {Object.entries(categories).map(([key, cat]) => (
                                <TabsContent key={key} value={key} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {cat.items.map(item => (
                                            <div key={item} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm truncate pr-2" title={item}>{item}</span>
                                                    <span className="text-xs text-muted-foreground">Batch: {batchSizes[item] || 1} pcs</span>
                                                </div>
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
                                                        step={batchSizes[item] || 1}
                                                        value={quantities[item] || ''}
                                                        onChange={(e) => handleQuantityChange(item, parseInt(e.target.value) || 0)}
                                                        className="w-16 h-8 text-center bg-transparent border-white/20 p-0"
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
                </Card>
            </div>

            {/* Right Column: Summary */}
            <div className="lg:col-span-1">
                <Card className="glass-card sticky top-6">
                    <CardHeader>
                        <CardTitle className="text-xl">Preparation Summary</CardTitle>
                        <CardDescription>Review items before submitting log</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.keys(quantities).length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No items selected yet.
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                                {Object.entries(quantities).map(([item, qty]) => (
                                    <div key={item} className="flex justify-between items-center text-sm p-2 rounded bg-white/5">
                                        <span className="font-medium truncate pr-2">{item}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-accent font-bold">x{qty}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                onClick={() => {
                                                    const { [item]: _, ...rest } = quantities;
                                                    setQuantities(rest);
                                                }}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                            <span className="font-semibold text-muted-foreground">Total Output</span>
                            <span className="text-2xl font-bold text-accent">{totalItems} <span className="text-xs font-normal text-muted-foreground">items</span></span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleClear}
                            disabled={Object.keys(quantities).length === 0 || isSubmitting}
                            className="flex-1 border-white/10"
                        >
                            Clear
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={Object.keys(quantities).length === 0 || isSubmitting}
                            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Send className="w-4 h-4 mr-2" />
                            )}
                            Submit Log
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
