'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Package } from 'lucide-react';
import { RAW_MATERIALS } from '@/constants/foodItems';

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
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/inventory');
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    // Merge DB items with RAW_MATERIALS to ensure all fields are visible
                    const serverItems: InventoryItem[] = data.items;
                    const mergedItems = RAW_MATERIALS.map(mat => {
                        const found = serverItems.find(i => i.itemName === mat);
                        return found || { itemName: mat, quantity: 0 };
                    });
                    setInventory(mergedItems);
                }
            }
        } catch (error) {
            console.error("Failed to fetch inventory", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuantityChange = (itemName: string, value: string) => {
        const parsed = parseInt(value, 10);
        if (isNaN(parsed) || parsed < 0) return;
        setPendingChanges(prev => ({ ...prev, [itemName]: parsed }));
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
            const res = await fetch('/api/inventory/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: itemsToUpdate,
                    updatedBy: currentUser?.name || currentUser?.username || 'Unknown Staff'
                })
            });

            const data = await res.json();
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

    return (
        <Card className="glass-card w-full">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-6 h-6 text-accent" />
                        Stock Inventory Management
                    </CardTitle>
                    <CardDescription>
                        Update raw materials based on recent deliveries or audits.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchInventory} disabled={isLoading || isSaving}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Refresh"}
                    </Button>
                    <Button onClick={handleSave} disabled={changedCount === 0 || isSaving || isLoading} className="bg-orange-600 hover:bg-orange-700">
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes ({changedCount})
                    </Button>
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
                        {inventory.map((item) => {
                            const isChanged = pendingChanges[item.itemName] !== undefined && pendingChanges[item.itemName] !== item.quantity;
                            return (
                                <div key={item.itemName} className={`p-4 rounded-xl border transition-colors flex flex-col justify-between h-full ${isChanged ? 'bg-orange-500/10 border-orange-500/50' : 'bg-black/20 border-white/5 hover:bg-black/40'}`}>
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-sm truncate mb-1" title={item.itemName}>{item.itemName}</h3>
                                        <p className="text-[10px] text-muted-foreground mb-3 opacity-60">Last updated: {item.lastUpdatedDate ? new Date(item.lastUpdatedDate).toLocaleDateString() : 'Never'}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Qty:</span>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={getDisplayQuantity(item.itemName, item.quantity)}
                                            onChange={(e) => handleQuantityChange(item.itemName, e.target.value)}
                                            className="w-20 text-center font-bold font-mono h-8 bg-black/40 border-white/10"
                                        />
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
