'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    UtensilsCrossed, Plus, Search, Edit3, Trash2, ShieldAlert,
    RefreshCw, Layers, DollarSign, Package, Clock, CheckCircle2,
    SlidersHorizontal, Sparkles, AlertTriangle, ArrowUpDown, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
    getMenuAndIngredients,
    saveMenuItem,
    deleteMenuItem,
    saveRawMaterial,
    deleteRawMaterial,
    resetMenuToDefaults
} from '@/actions/menu-management';

interface MenuManagerTabProps {
    userRole?: string;
}

interface IngredientRow {
    materialId: string;
    materialName: string;
    quantity: number;
}

export function MenuManagerTab({ userRole = 'staff' }: MenuManagerTabProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [rawMaterials, setRawMaterials] = useState<any[]>([]);
    const [canEdit, setCanEdit] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');

    // Dialog States
    const [dishDialogOpen, setDishDialogOpen] = useState(false);
    const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Editing Dish State
    const [editingDishId, setEditingDishId] = useState<string | null>(null);
    const [dishForm, setDishForm] = useState({
        name: '',
        category: 'Mains',
        price: 150,
        batchSize: 5,
        prepTime: '35s',
        description: '',
        imageUrl: '',
        station: 'Kitchen',
        ingredients: [] as IngredientRow[]
    });

    // Editing Material State
    const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
    const [materialForm, setMaterialForm] = useState({
        name: '',
        category: 'Meat & Seafood',
        ykzRate: 1500,
        mlbRate: 1500,
        unit: 'per unit',
        weight: 0.1
    });

    const isMajorRole = userRole === 'admin' || userRole === 'bulkhead';

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getMenuAndIngredients();
            if (res.success) {
                setMenuItems(res.menuItems || []);
                setRawMaterials(res.rawMaterials || []);
                setCanEdit(res.canEdit || false);
            } else {
                toast({
                    title: 'Failed to load menu data',
                    description: res.error,
                    variant: 'destructive'
                });
            }
        } catch (err: any) {
            toast({
                title: 'Error loading menu',
                description: err.message,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filtered Menu Items
    const filteredMenuItems = useMemo(() => {
        return menuItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
            return matchesSearch && matchesCat;
        });
    }, [menuItems, searchQuery, categoryFilter]);

    // Categories list for tabs
    const menuCategories = useMemo(() => {
        const cats = new Set<string>();
        menuItems.forEach(i => { if (i.category) cats.add(i.category); });
        return ['ALL', ...Array.from(cats)];
    }, [menuItems]);

    // Open Add/Edit Dish Modal
    const handleOpenDishModal = (dish?: any) => {
        if (dish) {
            setEditingDishId(dish.id);
            setDishForm({
                name: dish.name || '',
                category: dish.category || 'Mains',
                price: dish.price || 0,
                batchSize: dish.batchSize || 5,
                prepTime: dish.prepTime || '35s',
                description: dish.description || '',
                imageUrl: dish.imageUrl || '',
                station: dish.station || 'Kitchen',
                ingredients: dish.ingredients ? JSON.parse(JSON.stringify(dish.ingredients)) : []
            });
        } else {
            setEditingDishId(null);
            setDishForm({
                name: '',
                category: 'Mains',
                price: 150,
                batchSize: 5,
                prepTime: '35s',
                description: '',
                imageUrl: '',
                station: 'Kitchen',
                ingredients: []
            });
        }
        setDishDialogOpen(true);
    };

    // Open Add/Edit Material Modal
    const handleOpenMaterialModal = (material?: any) => {
        if (material) {
            setEditingMaterialId(material.id);
            setMaterialForm({
                name: material.name || '',
                category: material.category || 'Meat & Seafood',
                ykzRate: material.ykzRate || 0,
                mlbRate: material.mlbRate || 0,
                unit: material.unit || 'per unit',
                weight: material.weight || 0.1
            });
        } else {
            setEditingMaterialId(null);
            setMaterialForm({
                name: '',
                category: 'Meat & Seafood',
                ykzRate: 1500,
                mlbRate: 1500,
                unit: 'per unit',
                weight: 0.1
            });
        }
        setMaterialDialogOpen(true);
    };

    // Add ingredient row to dish form
    const handleAddIngredientRow = () => {
        if (rawMaterials.length === 0) return;
        const firstMat = rawMaterials[0];
        setDishForm(prev => ({
            ...prev,
            ingredients: [
                ...prev.ingredients,
                {
                    materialId: firstMat.id,
                    materialName: firstMat.name,
                    quantity: prev.batchSize || 5
                }
            ]
        }));
    };

    // Remove ingredient row
    const handleRemoveIngredientRow = (index: number) => {
        setDishForm(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== index)
        }));
    };

    // Update ingredient row
    const handleUpdateIngredientRow = (index: number, field: string, value: any) => {
        setDishForm(prev => {
            const updated = [...prev.ingredients];
            if (field === 'materialId') {
                const found = rawMaterials.find(rm => rm.id === value);
                updated[index] = {
                    ...updated[index],
                    materialId: value,
                    materialName: found ? found.name : value
                };
            } else if (field === 'quantity') {
                updated[index] = {
                    ...updated[index],
                    quantity: Math.max(1, Number(value) || 1)
                };
            }
            return { ...prev, ingredients: updated };
        });
    };

    // Save Dish
    const handleSaveDish = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!dishForm.name.trim()) {
            toast({ title: 'Validation Error', description: 'Dish name is required', variant: 'destructive' });
            return;
        }

        setSubmitting(true);
        try {
            const res = await saveMenuItem({
                id: editingDishId || undefined,
                name: dishForm.name,
                category: dishForm.category,
                price: Number(dishForm.price),
                batchSize: Number(dishForm.batchSize),
                prepTime: dishForm.prepTime,
                description: dishForm.description,
                imageUrl: dishForm.imageUrl,
                station: dishForm.station,
                ingredients: dishForm.ingredients
            });

            if (res.success) {
                toast({ title: 'Success', description: res.message });
                setDishDialogOpen(false);
                await loadData();
            } else {
                toast({ title: 'Error', description: res.error, variant: 'destructive' });
            }
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    // Delete Dish
    const handleDeleteDish = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}" from the menu?`)) return;
        try {
            const res = await deleteMenuItem(id);
            if (res.success) {
                toast({ title: 'Dish Deleted', description: res.message });
                await loadData();
            } else {
                toast({ title: 'Error', description: res.error, variant: 'destructive' });
            }
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
    };

    // Save Material
    const handleSaveMaterial = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!materialForm.name.trim()) {
            toast({ title: 'Validation Error', description: 'Ingredient name is required', variant: 'destructive' });
            return;
        }

        setSubmitting(true);
        try {
            const res = await saveRawMaterial({
                id: editingMaterialId || undefined,
                name: materialForm.name,
                category: materialForm.category,
                ykzRate: Number(materialForm.ykzRate),
                mlbRate: Number(materialForm.mlbRate),
                unit: materialForm.unit,
                weight: Number(materialForm.weight)
            });

            if (res.success) {
                toast({ title: 'Success', description: res.message });
                setMaterialDialogOpen(false);
                await loadData();
            } else {
                toast({ title: 'Error', description: res.error, variant: 'destructive' });
            }
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    // Delete Material
    const handleDeleteMaterial = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete the ingredient "${name}"?`)) return;
        try {
            const res = await deleteRawMaterial(id);
            if (res.success) {
                toast({ title: 'Ingredient Deleted', description: res.message });
                await loadData();
            } else {
                toast({ title: 'Cannot Delete Ingredient', description: res.error, variant: 'destructive' });
            }
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
    };

    // Reset Defaults
    const handleResetDefaults = async () => {
        if (!confirm('CAUTION: This will reset all menu items and raw materials back to factory Set A defaults. Are you sure?')) return;
        setLoading(true);
        try {
            const res = await resetMenuToDefaults();
            if (res.success) {
                toast({ title: 'Reset Complete', description: res.message });
                await loadData();
            } else {
                toast({ title: 'Error', description: res.error, variant: 'destructive' });
            }
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* ROLE STATUS BANNER */}
            <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                canEdit 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' 
                    : 'bg-zinc-800/60 border-zinc-700/50 text-zinc-300'
            }`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${canEdit ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-700 text-zinc-400'}`}>
                        <UtensilsCrossed className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">Menu & Recipes Management</h3>
                            <Badge variant={canEdit ? 'default' : 'outline'} className={canEdit ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 border-zinc-600'}>
                                {canEdit ? 'Full Edit Access' : 'View Only Mode'}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {canEdit
                                ? 'Changes made here dynamically update the Public Website Menu, Food Prep Calculator, Food Log, and Sales Log.'
                                : '🔒 Editing is restricted to Major Roles (Admin & Bulkhead / Management). You can view the current menu and recipes below.'}
                        </p>
                    </div>
                </div>

                {canEdit && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button
                            size="sm"
                            onClick={() => handleOpenDishModal()}
                            className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
                        >
                            <Plus className="w-4 h-4 mr-1.5" /> Add Menu Item
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenMaterialModal()}
                            className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                        >
                            <Plus className="w-4 h-4 mr-1.5" /> Add Ingredient
                        </Button>
                        {userRole === 'admin' && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleResetDefaults}
                                className="text-zinc-400 hover:text-red-400 text-xs"
                            >
                                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset Factory Defaults
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* MAIN TABS: MENU ITEMS vs INGREDIENTS */}
            <Tabs defaultValue="dishes" className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <TabsList className="bg-white/5 border border-white/10 p-1">
                        <TabsTrigger value="dishes" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black font-semibold">
                            Dishes & Recipes ({menuItems.length})
                        </TabsTrigger>
                        <TabsTrigger value="ingredients" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black font-semibold">
                            Raw Materials Pool ({rawMaterials.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Quick Search */}
                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search dishes or materials..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 bg-white/5 border-white/10 text-xs"
                        />
                    </div>
                </div>

                {/* TAB 1: DISHES & RECIPES */}
                <TabsContent value="dishes" className="space-y-4">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                        {menuCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                    categoryFilter === cat
                                        ? 'bg-amber-500 text-black font-bold shadow'
                                        : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                            <p className="text-sm">Loading menu & recipe configuration...</p>
                        </div>
                    ) : filteredMenuItems.length === 0 ? (
                        <div className="text-center py-12 border border-white/5 rounded-xl bg-white/5">
                            <UtensilsCrossed className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                            <p className="text-zinc-300 font-medium">No menu items found</p>
                            <p className="text-xs text-muted-foreground mt-1">Try adjusting your search query or category filter.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredMenuItems.map((item) => (
                                <Card key={item.id} className="glass-card border-white/10 flex flex-col justify-between hover:border-amber-500/40 transition-all">
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex items-center gap-3">
                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        className="w-12 h-12 rounded-lg object-cover border border-white/10 bg-black/40"
                                                        onError={(e) => { (e.currentTarget as any).src = '/Menu/single_chicken_burger.png'; }}
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                                                        <UtensilsCrossed className="w-6 h-6" />
                                                    </div>
                                                )}
                                                <div>
                                                    <CardTitle className="text-base text-white font-bold leading-tight">{item.name}</CardTitle>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-white/5 border-white/10 text-zinc-300">
                                                            {item.category}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-amber-500/10 border-amber-500/30 text-amber-300">
                                                            {item.station}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className="text-lg font-bold text-amber-400">${item.price}</span>
                                            </div>
                                        </div>

                                        {item.description && (
                                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{item.description}</p>
                                        )}
                                    </CardHeader>

                                    <CardContent className="p-4 pt-2 space-y-3">
                                        {/* Specs */}
                                        <div className="grid grid-cols-2 gap-2 text-xs bg-white/5 p-2 rounded-lg font-mono border border-white/5">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Batch Size:</span>
                                                <span className="text-white font-bold">{item.batchSize} pcs</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Prep Time:</span>
                                                <span className="text-amber-300">{item.prepTime || '30s'}</span>
                                            </div>
                                        </div>

                                        {/* Recipe Ingredients */}
                                        <div>
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                                                    <Layers className="w-3 h-3 text-amber-400" /> Recipe Ingredients ({item.ingredients?.length || 0})
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">per {item.batchSize} batch</span>
                                            </div>

                                            {item.ingredients && item.ingredients.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                                                    {item.ingredients.map((ing: any, i: number) => (
                                                        <span
                                                            key={i}
                                                            className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700 text-zinc-200 flex items-center gap-1"
                                                        >
                                                            <span className="text-amber-400 font-bold">{ing.quantity}x</span>
                                                            <span>{ing.materialName}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground italic">No ingredients specified.</p>
                                            )}
                                        </div>

                                        {/* Action Buttons for Authorized Roles */}
                                        {canEdit && (
                                            <div className="pt-2 border-t border-white/10 flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleOpenDishModal(item)}
                                                    className="h-8 text-xs border-white/10 hover:bg-white/10 text-zinc-200"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5 mr-1 text-amber-400" /> Edit Recipe
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteDish(item.id, item.name)}
                                                    className="h-8 text-xs text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* TAB 2: RAW MATERIALS POOL */}
                <TabsContent value="ingredients" className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                            <p className="text-sm">Loading raw materials pool...</p>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-white/10 overflow-hidden bg-black/40">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-white/5 border-b border-white/10 text-muted-foreground uppercase text-[10px] tracking-wider">
                                        <tr>
                                            <th className="p-3">Ingredient Name</th>
                                            <th className="p-3">Category</th>
                                            <th className="p-3">YKZ Rate</th>
                                            <th className="p-3">MLB Rate</th>
                                            <th className="p-3">Weight / Unit</th>
                                            {canEdit && <th className="p-3 text-right">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {rawMaterials
                                            .filter(rm => rm.name.toLowerCase().includes(searchQuery.toLowerCase()) || (rm.category && rm.category.toLowerCase().includes(searchQuery.toLowerCase())))
                                            .map((rm) => (
                                                <tr key={rm.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-3 font-semibold text-white flex items-center gap-2">
                                                        <Package className="w-3.5 h-3.5 text-amber-400" />
                                                        {rm.name}
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge variant="outline" className="text-[10px] py-0 bg-white/5 border-white/10 text-zinc-300">
                                                            {rm.category || 'General'}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3 font-mono text-green-400">${rm.ykzRate}</td>
                                                    <td className="p-3 font-mono text-purple-400">${rm.mlbRate}</td>
                                                    <td className="p-3 font-mono text-zinc-400">
                                                        {rm.weight} kg <span className="text-[10px] text-muted-foreground">({rm.unit || 'unit'})</span>
                                                    </td>
                                                    {canEdit && (
                                                        <td className="p-3 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleOpenMaterialModal(rm)}
                                                                    className="h-7 w-7 p-0 text-zinc-300 hover:text-amber-400"
                                                                >
                                                                    <Edit3 className="w-3.5 h-3.5" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleDeleteMaterial(rm.id, rm.name)}
                                                                    className="h-7 w-7 p-0 text-zinc-400 hover:text-red-400"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* MODAL 1: ADD / EDIT DISH & RECIPE */}
            <Dialog open={dishDialogOpen} onOpenChange={setDishDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-white/15 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <UtensilsCrossed className="w-5 h-5 text-amber-400" />
                            {editingDishId ? 'Edit Dish & Recipe' : 'Add New Menu Item'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Specify dish details and the exact ingredients required per preparation batch.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSaveDish} className="space-y-4 pt-2">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-zinc-300 block mb-1">Dish Name *</label>
                                <Input
                                    value={dishForm.name}
                                    onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                                    placeholder="e.g. Double Cheese Beef Burger"
                                    required
                                    className="bg-white/5 border-white/10 text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-zinc-300 block mb-1">Category *</label>
                                <Input
                                    value={dishForm.category}
                                    onChange={(e) => setDishForm({ ...dishForm, category: e.target.value })}
                                    placeholder="e.g. Burgers, Italian, Beverages, Mains"
                                    required
                                    className="bg-white/5 border-white/10 text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-zinc-300 block mb-1">Price ($) *</label>
                                <Input
                                    type="number"
                                    value={dishForm.price}
                                    onChange={(e) => setDishForm({ ...dishForm, price: Number(e.target.value) })}
                                    required
                                    min="0"
                                    className="bg-white/5 border-white/10 text-sm font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-zinc-300 block mb-1">Batch Size (pcs) *</label>
                                <Input
                                    type="number"
                                    value={dishForm.batchSize}
                                    onChange={(e) => setDishForm({ ...dishForm, batchSize: Number(e.target.value) })}
                                    required
                                    min="1"
                                    className="bg-white/5 border-white/10 text-sm font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-zinc-300 block mb-1">Prep Time</label>
                                <Input
                                    value={dishForm.prepTime}
                                    onChange={(e) => setDishForm({ ...dishForm, prepTime: e.target.value })}
                                    placeholder="e.g. 35s"
                                    className="bg-white/5 border-white/10 text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-zinc-300 block mb-1">Station</label>
                                <Input
                                    value={dishForm.station}
                                    onChange={(e) => setDishForm({ ...dishForm, station: e.target.value })}
                                    placeholder="Kitchen, Grill, Drinks"
                                    className="bg-white/5 border-white/10 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-zinc-300 block mb-1">Image URL / Path</label>
                            <Input
                                value={dishForm.imageUrl}
                                onChange={(e) => setDishForm({ ...dishForm, imageUrl: e.target.value })}
                                placeholder="/Menu/double_cheese_beef_burger.png"
                                className="bg-white/5 border-white/10 text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-zinc-300 block mb-1">Description</label>
                            <Input
                                value={dishForm.description}
                                onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                                placeholder="Short culinary description for public menu..."
                                className="bg-white/5 border-white/10 text-sm"
                            />
                        </div>

                        {/* INGREDIENTS BUILDER */}
                        <div className="pt-2 border-t border-white/10 space-y-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                                        <Layers className="w-4 h-4 text-amber-400" />
                                        Recipe Ingredients (Required per batch of {dishForm.batchSize})
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground">Select materials and how many are used for each preparation batch.</p>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleAddIngredientRow}
                                    className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs h-7"
                                >
                                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Ingredient
                                </Button>
                            </div>

                            {dishForm.ingredients.length === 0 ? (
                                <div className="p-4 border border-dashed border-white/10 rounded-lg text-center text-xs text-muted-foreground">
                                    No ingredients added yet. Click &quot;Add Ingredient&quot; above to link raw materials to this recipe.
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {dishForm.ingredients.map((ing, index) => (
                                        <div key={index} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                                            <div className="flex-1">
                                                <Select
                                                    value={ing.materialId}
                                                    onValueChange={(val) => handleUpdateIngredientRow(index, 'materialId', val)}
                                                >
                                                    <SelectTrigger className="bg-zinc-900 border-white/10 text-xs h-8">
                                                        <SelectValue placeholder="Select ingredient" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-56">
                                                        {rawMaterials.map(rm => (
                                                            <SelectItem key={rm.id} value={rm.id} className="text-xs">
                                                                {rm.name} ({rm.category || 'General'})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="w-28 flex items-center gap-1">
                                                <Input
                                                    type="number"
                                                    value={ing.quantity}
                                                    onChange={(e) => handleUpdateIngredientRow(index, 'quantity', e.target.value)}
                                                    min="1"
                                                    required
                                                    className="bg-zinc-900 border-white/10 text-xs h-8 font-mono text-center"
                                                />
                                                <span className="text-[10px] text-muted-foreground">qty</span>
                                            </div>

                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleRemoveIngredientRow(index)}
                                                className="h-8 w-8 p-0 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="pt-4 border-t border-white/10">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDishDialogOpen(false)}
                                className="border-white/10 text-zinc-300"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
                            >
                                {submitting ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                {editingDishId ? 'Update Dish' : 'Create Dish'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL 2: ADD / EDIT RAW MATERIAL */}
            <Dialog open={materialDialogOpen} onOpenChange={setMaterialDialogOpen}>
                <DialogContent className="max-w-md bg-zinc-950 border border-white/15 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Package className="w-5 h-5 text-amber-400" />
                            {editingMaterialId ? 'Edit Ingredient' : 'Add New Raw Material'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Define a raw material that can be used in dish preparation and calculator requirements.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSaveMaterial} className="space-y-4 pt-2">
                        <div>
                            <label className="text-xs font-semibold text-zinc-300 block mb-1">Ingredient Name *</label>
                            <Input
                                value={materialForm.name}
                                onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                                placeholder="e.g. Beef Raw, Burger Bun, Mozzarella"
                                required
                                className="bg-white/5 border-white/10 text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-zinc-300 block mb-1">Category</label>
                            <Input
                                value={materialForm.category}
                                onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })}
                                placeholder="e.g. Meat & Seafood, Dairy & Eggs, Grains & Bakery"
                                className="bg-white/5 border-white/10 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-zinc-300 block mb-1">YKZ Rate ($) *</label>
                                <Input
                                    type="number"
                                    value={materialForm.ykzRate}
                                    onChange={(e) => setMaterialForm({ ...materialForm, ykzRate: Number(e.target.value) })}
                                    required
                                    min="0"
                                    className="bg-white/5 border-white/10 text-sm font-mono text-green-400"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-zinc-300 block mb-1">MLB Rate ($) *</label>
                                <Input
                                    type="number"
                                    value={materialForm.mlbRate}
                                    onChange={(e) => setMaterialForm({ ...materialForm, mlbRate: Number(e.target.value) })}
                                    required
                                    min="0"
                                    className="bg-white/5 border-white/10 text-sm font-mono text-purple-400"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-zinc-300 block mb-1">Weight (kg)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={materialForm.weight}
                                    onChange={(e) => setMaterialForm({ ...materialForm, weight: Number(e.target.value) })}
                                    min="0"
                                    className="bg-white/5 border-white/10 text-sm font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-zinc-300 block mb-1">Unit</label>
                                <Input
                                    value={materialForm.unit}
                                    onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
                                    placeholder="per unit, per kg"
                                    className="bg-white/5 border-white/10 text-sm"
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-white/10">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setMaterialDialogOpen(false)}
                                className="border-white/10 text-zinc-300"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
                            >
                                {submitting ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                {editingMaterialId ? 'Update Ingredient' : 'Create Ingredient'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default MenuManagerTab;
