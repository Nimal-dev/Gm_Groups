'use client';

import { useState, useMemo, useEffect } from 'react';
import { SALES_ITEMS } from '@/constants/salesItems';
import { submitSalesLog } from '@/actions/sales';
import { getMenuAndIngredients } from '@/actions/menu-management';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Minus, Send, Trash2, ShoppingCart, DollarSign, Percent } from 'lucide-react';

export function SalesLogForm() {
    const { toast } = useToast();
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [customPrices, setCustomPrices] = useState<Record<string, number>>({});
    const [discount, setDiscount] = useState<string>('0');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dynamic Sales Items state
    const [salesCategories, setSalesCategories] = useState<Record<string, { label: string; items: Array<{ id: string; name: string; price: number }> }>>(SALES_ITEMS);
    const [activeTab, setActiveTab] = useState(Object.keys(SALES_ITEMS)[0]);

    useEffect(() => {
        getMenuAndIngredients().then((res) => {
            if (res.success && res.menuItems?.length > 0) {
                const grouped: Record<string, { label: string; items: Array<{ id: string; name: string; price: number }> }> = {};
                res.menuItems.forEach((item: any) => {
                    const catKey = (item.category || 'Mains').toLowerCase().replace(/[^a-z0-9]+/g, '_');
                    const catLabel = item.category || 'Mains';
                    if (!grouped[catKey]) {
                        grouped[catKey] = { label: catLabel, items: [] };
                    }
                    grouped[catKey].items.push({
                        id: item.id,
                        name: item.name,
                        price: item.price || 150
                    });
                });
                setSalesCategories(grouped);
                setActiveTab(prev => grouped[prev] ? prev : Object.keys(grouped)[0]);
            }
        }).catch(err => console.error("Failed to load dynamic sales items:", err));
    }, []);

    // Flatten items for easy lookup
    const allItems = useMemo(() => {
        return Object.values(salesCategories).flatMap(cat => cat.items);
    }, [salesCategories]);

    const handleQuantityChange = (itemId: string, value: number) => {
        const newVal = Math.max(0, value);
        setQuantities(prev => {
            if (newVal === 0) {
                const { [itemId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [itemId]: newVal };
        });
    };

    const handlePriceChange = (itemId: string, value: string) => {
        const numVal = parseInt(value) || 0;
        setCustomPrices(prev => ({ ...prev, [itemId]: numVal }));
    };

    const adjustQuantity = (itemId: string, delta: number) => {
        setQuantities(prev => {
            const current = prev[itemId] || 0;
            const newVal = Math.max(0, current + delta);
            if (newVal === 0) {
                const { [itemId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [itemId]: newVal };
        });
    };

    const handleClear = () => {
        if (confirm('Are you sure you want to clear the sales log?')) {
            setQuantities({});
            setCustomPrices({});
            setDiscount('0');
        }
    };

    const totals = useMemo(() => {
        let subtotal = 0;
        const itemsToSubmit = [];

        for (const [itemId, qty] of Object.entries(quantities)) {
            const itemString = itemId as string; // Fix for Object.entries types
            const item = allItems.find(i => i.id === itemString);
            if (!item || qty <= 0) continue;

            const price = customPrices[itemString] !== undefined ? customPrices[itemString] : item.price;
            subtotal += price * qty;
            itemsToSubmit.push({
                name: item.name,
                quantity: qty,
                price: price
            });
        }

        const discPercent = parseFloat(discount) || 0;
        const discountAmount = (subtotal * discPercent) / 100;
        const grandTotal = subtotal - discountAmount;

        return { itemsToSubmit, subtotal, discountAmount, grandTotal };
    }, [quantities, customPrices, discount, allItems]);

    const handleSubmit = async () => {
        if (totals.itemsToSubmit.length === 0) {
            toast({ title: 'Empty Log', description: 'Please add at least one item.', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await submitSalesLog(totals.itemsToSubmit, parseFloat(discount) || 0, totals.grandTotal);
            if (res.success) {
                toast({
                    title: 'Sales Log Submitted',
                    description: 'Transaction recorded and sent to Discord.',
                    className: 'bg-green-600 border-none text-white'
                });
                setQuantities({});
                setCustomPrices({});
                setDiscount('0');
            } else {
                toast({ title: 'Submission Failed', description: res.error, variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto w-full items-start">
            {/* Left Column: Interactive Menu */}
            <div className="lg:col-span-8 flex flex-col gap-6">
                <Card className="glass-card w-full overflow-hidden border-white/10">
                    <CardHeader className="bg-gradient-to-r from-accent/10 to-transparent">
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <ShoppingCart className="w-7 h-7 text-accent" />
                            Sales Logger
                        </CardTitle>
                        <CardDescription>
                            Select food and drinks, adjust quantities and prices as needed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                            <div className="overflow-x-auto pb-4 hide-scrollbar">
                                <TabsList className="bg-black/20 p-1 h-auto flex gap-1 w-max rounded-xl border border-white/5">
                                    {Object.entries(salesCategories).map(([key, cat]) => (
                                        <TabsTrigger
                                            key={key}
                                            value={key}
                                            className="px-4 py-2 rounded-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground transition-all duration-200"
                                        >
                                            {cat.label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>

                            {Object.entries(salesCategories).map(([key, cat]) => (
                                <TabsContent key={key} value={key} className="mt-0 focus-visible:outline-none">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {cat.items.map(item => (
                                            <div key={item.id} className="group flex flex-col p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-accent/30 transition-all duration-300">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span className="font-bold text-base truncate pr-2 text-white" title={item.name}>{item.name}</span>
                                                        <span className="text-xs text-accent/80 font-mono">Base: ${item.price.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-black/40 rounded-full p-1 border border-white/5">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 rounded-full hover:bg-red-500/20 hover:text-red-400"
                                                            onClick={() => adjustQuantity(item.id, -1)}
                                                            disabled={!quantities[item.id]}
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </Button>
                                                        <Input
                                                            type="number"
                                                            value={quantities[item.id] || 0}
                                                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                                                            className="w-10 h-7 p-0 text-center text-sm font-bold font-mono bg-transparent border-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 rounded-full hover:bg-green-500/20 hover:text-green-400"
                                                            onClick={() => adjustQuantity(item.id, 1)}
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Price Override Field */}
                                                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-muted-foreground">
                                                    <span>Custom Unit Price:</span>
                                                    <div className="flex items-center gap-1.5 w-32">
                                                        <DollarSign className="w-3 h-3 text-muted-foreground/60" />
                                                        <Input
                                                            type="number"
                                                            placeholder={item.price.toString()}
                                                            value={customPrices[item.id] !== undefined ? customPrices[item.id] : ''}
                                                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                                            className="h-7 text-right font-mono bg-black/40 border-white/10 text-xs text-accent focus-visible:border-accent"
                                                        />
                                                    </div>
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

            {/* Right Column: Checkout Summary Receipt */}
            <div className="lg:col-span-4 flex flex-col gap-6 sticky top-6">
                <Card className="glass-card border-white/10 overflow-hidden shadow-2xl">
                    <CardHeader className="border-b border-white/5 bg-white/5">
                        <CardTitle className="flex justify-between items-center text-lg">
                            <span>Receipt Summary</span>
                            <span className="text-xs font-mono font-normal text-muted-foreground">{totals.itemsToSubmit.reduce((a, b) => a + b.quantity, 0)} Items</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {/* Order Items List */}
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                            {totals.itemsToSubmit.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground flex flex-col items-center gap-2">
                                    <ShoppingCart className="w-8 h-8 opacity-20" />
                                    <p className="text-sm">No items added to current sale</p>
                                </div>
                            ) : (
                                totals.itemsToSubmit.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-white/5">
                                        <div className="flex flex-col flex-1 min-w-0 pr-2">
                                            <span className="font-semibold text-white truncate">{item.name}</span>
                                            <span className="text-xs text-muted-foreground font-mono">{item.quantity} × ${item.price.toLocaleString()}</span>
                                        </div>
                                        <span className="font-bold text-accent font-mono shrink-0">${(item.quantity * item.price).toLocaleString()}</span>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Financial calculations */}
                        <div className="space-y-3 pt-4 border-t border-white/5 text-sm">
                            <div className="flex justify-between items-center text-muted-foreground">
                                <span>Subtotal</span>
                                <span className="font-mono text-white">${totals.subtotal.toLocaleString()}</span>
                            </div>

                            <div className="flex flex-col gap-2 p-3 rounded-lg bg-black/30 border border-white/5">
                                <div className="flex justify-between items-center">
                                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Percent className="w-3 h-3 text-accent" /> Discount
                                    </Label>
                                    <div className="flex items-center gap-1 w-20">
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={discount}
                                            onChange={(e) => setDiscount(e.target.value)}
                                            className="h-7 text-right font-mono bg-black/60 border-white/10 text-xs text-accent"
                                        />
                                    </div>
                                </div>
                                {totals.discountAmount > 0 && (
                                    <div className="flex justify-between items-center text-xs text-red-400 font-mono">
                                        <span>Saving</span>
                                        <span>-${totals.discountAmount.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t-2 border-accent/20">
                            <div className="flex justify-between items-baseline mb-6">
                                <span className="text-lg font-bold text-white uppercase tracking-tighter">Total</span>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-accent font-mono block tracking-tighter">
                                        ${totals.grandTotal.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || totals.itemsToSubmit.length === 0}
                                    className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-black text-lg shadow-[0_0_20px_rgba(39,203,99,0.3)] transition-all active:scale-[0.98]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> SUBMITTING...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5 mr-2" /> SUBMIT LOG
                                        </>
                                    )}
                                </Button>
                                {totals.itemsToSubmit.length > 0 && (
                                    <Button variant="ghost" onClick={handleClear} className="text-muted-foreground hover:text-red-400 h-10">
                                        <Trash2 className="w-4 h-4 mr-2" /> Clear All Items
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-black/20 p-4">
                        <p className="text-[10px] text-center w-full text-muted-foreground uppercase tracking-widest font-bold">
                            Official Staff Sales Transaction
                        </p>
                    </CardFooter>
                </Card>

                <Card className="glass-card bg-orange-500/5 border-orange-500/20">
                    <CardContent className="p-4 flex gap-3 text-orange-400 text-xs italic">
                        <div className="h-5 w-5 rounded-full border border-orange-400 flex items-center justify-center shrink-0 font-bold">!</div>
                        <p>Verify quantities and total before submitting. All sales logs are recorded for tax and audit purposes.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
