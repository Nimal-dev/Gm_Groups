'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Package, Plus, Search } from 'lucide-react';
import { RAW_MATERIALS } from '@/constants/foodItems';
import { getInventory, updateInventory } from '@/actions/inventory';

interface InventoryItem {
    itemName: string;
    quantity: number;
    lastUpdatedBy?: string;
    lastUpdatedDate?: string;
}

export function InventoryManager({ currentUser }: { currentUser: any }) {
    const { toast } = useToast();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [pendingChanges, setPendingChanges] = useState<Record<string, number>>({});
    const [additionalChanges, setAdditionalChanges] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setIsLoading(true);
        try {
            const data = await getInventory();
            if (data.success && data.items) {
                // Merge DB items with RAW_MATERIALS to ensure all fields are visible
                const serverItems: InventoryItem[] = data.items;
                const mergedItems = RAW_MATERIALS.map(mat => {
                    const found = serverItems.find(i => i.itemName === mat);
                    return found || { itemName: mat, quantity: 0 };
                });
                setInventory(mergedItems);
            } else {
                toast({ title: 'Fetch Error', description: data.error, variant: 'destructive' });
                // Fallback to empty values if completely fails so page doesn't break
                const fallbackItems = RAW_MATERIALS.map(mat => ({ itemName: mat, quantity: 0 }));
                setInventory(fallbackItems);
            }
        } catch (error) {
            console.error("Failed to fetch inventory", error);
            const fallbackItems = RAW_MATERIALS.map(mat => ({ itemName: mat, quantity: 0 }));
            setInventory(fallbackItems);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuantityChange = (itemName: string, value: string) => {
        const parsed = parseInt(value, 10);
        if (isNaN(parsed) || parsed < 0) return;
        setPendingChanges(prev => ({ ...prev, [itemName]: parsed }));
    };

    const handleAddChange = (itemName: string, value: string) => {
        setAdditionalChanges(prev => ({ ...prev, [itemName]: value }));
    };

    const handleApplyAddition = (itemName: string, currentQty: number) => {
        const addValue = parseInt(additionalChanges[itemName] || "0", 10);
        if (isNaN(addValue) || addValue <= 0) return;

        const baseQty = pendingChanges[itemName] !== undefined ? pendingChanges[itemName] : currentQty;
        const newTotal = baseQty + addValue;
        
        setPendingChanges(prev => ({ ...prev, [itemName]: newTotal }));
        
        setAdditionalChanges(prev => {
            const temp = { ...prev };
            delete temp[itemName];
            return temp;
        });
    };

    const getDisplayQuantity = (itemName: string, originalQty: number) => {
        if (pendingChanges[itemName] !== undefined) {
            return pendingChanges[itemName];
        }
        return originalQty;
    };

    const handleSave = async () => {
        const itemsToUpdate = Object.keys(pendingChanges).map(itemName => ({
            itemName,
            newQuantity: pendingChanges[itemName]
        }));

        if (itemsToUpdate.length === 0) {
            toast({ title: "No changes", description: "There are no inventory changes to save.", variant: "default" });
            return;
        }

        setIsSaving(true);
        try {
            const data = await updateInventory(itemsToUpdate);

            if (data.success) {
                toast({ title: 'Success', description: 'Inventory updated and logged to Discord.', className: 'bg-green-600 border-none' });
                setPendingChanges({});
                fetchInventory(); // Refresh view
            } else {
                toast({ title: 'Error', description: data.error, variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update inventory', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    // Calculate changed count to enable/disable button
    const changedCount = Object.keys(pendingChanges).filter(k => {
        const item = inventory.find(i => i.itemName === k);
        return item ? pendingChanges[k] !== item.quantity : true;
    }).length;

    const filteredInventory = inventory.filter(item =>
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Card className="glass-card w-full">
            <CardHeader className="flex flex-col sm:flex-row sm:items-start lg:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
                <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-6 h-6 text-accent" />
                        Stock Inventory Management
                    </CardTitle>
                    <CardDescription>
                        Update raw materials based on recent deliveries or audits.
                    </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-black/40 border-white/10 w-full"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={fetchInventory} disabled={isLoading || isSaving} className="flex-1 sm:flex-none">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Refresh"}
                        </Button>
                        <Button onClick={handleSave} disabled={changedCount === 0 || isSaving || isLoading} className="bg-orange-600 hover:bg-orange-700 flex-1 sm:flex-none">
                            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save ({changedCount})
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading && inventory.length === 0 ? (
                    <div className="py-20 flex justify-center items-center opacity-50 text-accent">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* We use a merged list of all known materials plus DB items in case DB lacks some initially */}
                        {filteredInventory.map((item) => {
                            const isChanged = pendingChanges[item.itemName] !== undefined && pendingChanges[item.itemName] !== item.quantity;
                            return (
                                <div key={item.itemName} className={`p-4 rounded-xl border transition-colors flex flex-col justify-between h-full ${isChanged ? 'bg-orange-500/10 border-orange-500/50' : 'bg-black/20 border-white/5 hover:bg-black/40'}`}>
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-sm truncate mb-1" title={item.itemName}>{item.itemName}</h3>
                                        <p className="text-[10px] text-muted-foreground mb-3 opacity-60">Last updated: {item.lastUpdatedDate ? new Date(item.lastUpdatedDate).toLocaleDateString() : 'Never'}</p>
                                    </div>
                                    <div className="flex flex-col gap-2 mt-auto">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Qty:</span>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={getDisplayQuantity(item.itemName, item.quantity)}
                                                onChange={(e) => handleQuantityChange(item.itemName, e.target.value)}
                                                className="w-20 text-center font-bold font-mono h-8 bg-black/40 border-white/10"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                            <span className="text-[10px] text-green-500 uppercase tracking-widest font-mono">+ Add:</span>
                                            <div className="flex gap-1 items-center">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="0"
                                                    value={additionalChanges[item.itemName] || ''}
                                                    onChange={(e) => handleAddChange(item.itemName, e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleApplyAddition(item.itemName, item.quantity);
                                                        }
                                                    }}
                                                    className="w-12 text-center text-xs h-6 bg-black/40 border-green-500/30 text-green-400 placeholder:text-green-500/30 px-1"
                                                />
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost" 
                                                    onClick={() => handleApplyAddition(item.itemName, item.quantity)}
                                                    className="h-6 w-6 text-green-500 hover:text-green-400 hover:bg-green-500/20"
                                                    title="Add to total"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
