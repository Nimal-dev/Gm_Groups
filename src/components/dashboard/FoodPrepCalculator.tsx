'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Calculator, ArrowRight, Package, Scale, 
  DollarSign, ShoppingCart, Info, Building2, Layers,
  CheckCircle2, AlertCircle, X, Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MENU_ITEMS, RAW_MATERIALS, calculateRequirements } from '@/lib/food-data';
import { useRouter } from 'next/navigation';

export function FoodPrepCalculator() {
    const router = useRouter();
    const [selections, setSelections] = useState<{ id: string; targetQuantity: number }[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [partnerPreference, setPartnerPreference] = useState<'YKZ' | 'MLB' | 'BOTH'>('BOTH');

    const filteredMenuItems = useMemo(() => {
        return MENU_ITEMS.filter(item => 
            item.category !== 'Component' && 
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const addItem = (itemId: string) => {
        if (selections.find(s => s.id === itemId)) return;
        setSelections([...selections, { id: itemId, targetQuantity: 0 }]);
    };

    const updateQuantity = (itemId: string, qty: number) => {
        setSelections(selections.map(s => s.id === itemId ? { ...s, targetQuantity: Math.max(0, qty) } : s));
    };

    const removeItem = (itemId: string) => {
        setSelections(selections.filter(s => s.id !== itemId));
    };

    const results = useMemo(() => calculateRequirements(selections), [selections]);

    const totals = useMemo(() => {
        return results.reduce((acc, curr) => ({
            ykz: acc.ykz + curr.ykzCost,
            mlb: acc.mlb + curr.mlbCost,
            weight: acc.weight + curr.weight,
            items: acc.items + curr.quantity
        }), { ykz: 0, mlb: 0, weight: 0, items: 0 });
    }, [results]);

    const generateRequestUrl = (partner: 'YKZ' | 'MLB') => {
        const itemsStr = results.map(r => `${r.quantity}x ${RAW_MATERIALS[r.materialId].name}`).join('\n');
        const notes = `Target Food Prep:\n${selections.map(s => `${s.targetQuantity}x ${MENU_ITEMS.find(m => m.id === s.id)?.name}`).join('\n')}\nEstimated Weight: ${totals.weight.toFixed(2)}kg.`;
        return `/rawrequest?partner=${partner}&items=${encodeURIComponent(itemsStr)}&notes=${encodeURIComponent(notes)}`;
    };

    const handleTransfer = (partner: 'YKZ' | 'MLB') => {
        router.push(generateRequestUrl(partner));
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-20">
            {/* LEFT COLUMN: SELECTION */}
            <div className="xl:col-span-5 space-y-6">
                <Card className="glass-pane border-white/10 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-primary" /> Selection Matrix
                        </CardTitle>
                        <CardDescription>Select menu items and target quantities.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search menu..." 
                                className="pl-9 bg-white/5 border-white/10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <ScrollArea className="h-[200px] pr-4">
                            <div className="grid grid-cols-2 gap-2">
                                {filteredMenuItems.map(item => (
                                    <Button
                                        key={item.id}
                                        variant="outline"
                                        size="sm"
                                        className={`justify-start text-xs h-10 border-white/5 bg-white/5 hover:bg-primary/20 hover:border-primary/30 transition-all ${selections.find(s => s.id === item.id) ? 'border-primary/50 bg-primary/10' : ''}`}
                                        onClick={() => addItem(item.id)}
                                    >
                                        <Plus className="w-3 h-3 mr-2" />
                                        {item.name}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="space-y-3 pt-4 border-t border-white/10">
                            <AnimatePresence mode="popLayout">
                                {selections.map(selection => {
                                    const item = MENU_ITEMS.find(m => m.id === selection.id);
                                    return (
                                        <motion.div
                                            key={selection.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 group"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate">{item?.name}</p>
                                                <p className="text-[10px] text-muted-foreground">Batch: {item?.batchSize} units</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    value={selection.targetQuantity || ''}
                                                    onChange={(e) => updateQuantity(selection.id, parseInt(e.target.value) || 0)}
                                                    className="w-20 bg-black/40 border-white/10 text-center h-8 text-sm focus:ring-primary/30"
                                                    placeholder="Qty"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                                                    onClick={() => removeItem(selection.id)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            {selections.length === 0 && (
                                <div className="text-center py-8 opacity-30">
                                    <ShoppingCart className="w-8 h-8 mx-auto mb-2" />
                                    <p className="text-xs">No items selected</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="glass-pane border-white/10 bg-gradient-to-br from-blue-500/5 to-transparent">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Scale className="w-5 h-5 text-blue-400 mb-2" />
                            <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold">Total Weight</p>
                            <h3 className="text-xl font-black font-mono">{totals.weight.toFixed(2)}<span className="text-xs ml-1">KG</span></h3>
                        </CardContent>
                    </Card>
                    <Card className="glass-pane border-white/10 bg-gradient-to-br from-purple-500/5 to-transparent">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Package className="w-5 h-5 text-purple-400 mb-2" />
                            <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold">Total Items</p>
                            <h3 className="text-xl font-black font-mono">{totals.items.toLocaleString()}</h3>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* RIGHT COLUMN: RESULTS */}
            <div className="xl:col-span-7 space-y-6">
                <Card className="glass-pane border-white/10 h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-primary" /> Calculation Engine
                            </CardTitle>
                            <CardDescription>Breakdown of required raw materials.</CardDescription>
                        </div>
                        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                            {(['BOTH', 'YKZ', 'MLB'] as const).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPartnerPreference(p)}
                                    className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${partnerPreference === p ? 'bg-primary text-black shadow-lg' : 'text-muted-foreground hover:text-white'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden flex flex-col">
                        <ScrollArea className="flex-1 min-h-[400px]">
                            <Table>
                                <TableHeader className="bg-white/5 sticky top-0 z-10">
                                    <TableRow className="border-white/10">
                                        <TableHead className="text-xs">Raw Material</TableHead>
                                        <TableHead className="text-right text-xs">Qty</TableHead>
                                        <TableHead className="text-right text-xs">Weight</TableHead>
                                        {(partnerPreference === 'BOTH' || partnerPreference === 'YKZ') && (
                                            <TableHead className="text-right text-xs text-yellow-400">YKZ Cost</TableHead>
                                        )}
                                        {(partnerPreference === 'BOTH' || partnerPreference === 'MLB') && (
                                            <TableHead className="text-right text-xs text-blue-400">MLB Cost</TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.map(r => (
                                        <TableRow key={r.materialId} className="border-white/5 hover:bg-white/[0.02]">
                                            <TableCell className="font-medium text-sm">
                                                {RAW_MATERIALS[r.materialId]?.name}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-xs">{r.quantity.toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-mono text-xs">{r.weight.toFixed(2)} kg</TableCell>
                                            {(partnerPreference === 'BOTH' || partnerPreference === 'YKZ') && (
                                                <TableCell className="text-right font-mono text-xs text-yellow-500/80">
                                                    ${r.ykzCost.toLocaleString()}
                                                </TableCell>
                                            )}
                                            {(partnerPreference === 'BOTH' || partnerPreference === 'MLB') && (
                                                <TableCell className="text-right font-mono text-xs text-blue-500/80">
                                                    ${r.mlbCost.toLocaleString()}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                    {results.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-20 text-muted-foreground opacity-30">
                                                <Info className="w-10 h-10 mx-auto mb-2" />
                                                <p>Configure items to see breakdown</p>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </ScrollArea>

                        <div className="mt-6 p-6 rounded-2xl bg-black/40 border border-white/10 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">YKZ Logistics</p>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] border-yellow-500/20 text-yellow-400 bg-yellow-500/5">Source A</Badge>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black font-mono">${totals.ykz.toLocaleString()}</span>
                                    </div>
                                    <Button 
                                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-12 rounded-xl group transition-all"
                                        disabled={results.length === 0}
                                        onClick={() => handleTransfer('YKZ')}
                                    >
                                        Request from YKZ <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">MLB Logistics</p>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] border-blue-500/20 text-blue-400 bg-blue-500/5">Source B</Badge>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black font-mono">${totals.mlb.toLocaleString()}</span>
                                    </div>
                                    <Button 
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl group transition-all"
                                        disabled={results.length === 0}
                                        onClick={() => handleTransfer('MLB')}
                                    >
                                        Request from MLB <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-white/5 flex items-start gap-3">
                                <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                    Prices shown are based on latest partnership rates. Transferring to the request form will auto-populate items and estimated logistics details for approval.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
