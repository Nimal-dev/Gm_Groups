'use client';

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import {
    SET_A_MENU_ITEMS,
    STATION_CONFIG,
    GMMenuItem,
    StationType
} from "@/data/menuData";
import { getMenuAndIngredients } from "@/actions/menu-management";
import {
    Search,
    Flame,
    Utensils,
    Wine,
    Sparkles,
    SlidersHorizontal,
    X,
    Info,
    Droplets
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";

export function MenuSection({ initialItems }: { initialItems?: GMMenuItem[] } = {}) {
    const [selectedStation, setSelectedStation] = useState<StationType | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [statFilter, setStatFilter] = useState<'all' | 'hunger' | 'thirst'>('all');
    const [selectedItem, setSelectedItem] = useState<GMMenuItem | null>(null);
    const [menuItems, setMenuItems] = useState<GMMenuItem[]>(initialItems && initialItems.length > 0 ? initialItems : SET_A_MENU_ITEMS);

    // Load live dishes dynamically from MongoDB on client
    useEffect(() => {
        if (!initialItems || initialItems.length === 0) {
            getMenuAndIngredients().then((res) => {
                if (res.success && res.menuItems?.length > 0) {
                    const mapped: GMMenuItem[] = res.menuItems.map((item: any) => ({
                        id: item.id,
                        name: item.name,
                        jpName: '',
                        description: item.description || '',
                        price: item.price,
                        priceFormatted: `$${item.price.toLocaleString()}`,
                        statType: (item.thirst > 0 ? 'thirst' : 'hunger') as 'hunger' | 'thirst',
                        statValue: item.thirst || item.hunger || 50,
                        statFormatted: item.thirst > 0 ? `+${item.thirst || 50} Thirst` : `+${item.hunger || 50} Hunger`,
                        station: ((item.station?.toLowerCase().includes('drink') || item.station?.toLowerCase().includes('beverage')) ? 'beverage' : (item.station?.toLowerCase().includes('grill') ? 'grill' : 'finishing')) as StationType,
                        stationLabel: item.station || 'Kitchen',
                        stationColor: (item.station?.toLowerCase().includes('drink') || item.station?.toLowerCase().includes('beverage')) ? '#366a95' : (item.station?.toLowerCase().includes('grill') ? '#c1785b' : '#ad875c'),
                        image: item.imageUrl || '/Menu/single_chicken_burger.png',
                        tag: item.category || 'Mains',
                        set: 'Set A' as const
                    }));
                    setMenuItems(mapped);
                }
            }).catch(err => console.error('Failed to load dynamic public menu:', err));
        }
    }, [initialItems]);

    // Filter items based on filters and search
    const filteredItems = useMemo(() => {
        return menuItems.filter(item => {
            // Station filter
            if (selectedStation !== 'all' && item.station !== selectedStation) {
                return false;
            }
            // Stat filter (hunger / thirst)
            if (statFilter !== 'all' && item.statType !== statFilter) {
                return false;
            }
            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchName = item.name.toLowerCase().includes(q);
                const matchDesc = item.description.toLowerCase().includes(q);
                const matchTag = item.tag.toLowerCase().includes(q);
                if (!matchName && !matchDesc && !matchTag) {
                    return false;
                }
            }
            return true;
        });
    }, [menuItems, selectedStation, statFilter, searchQuery]);

    // Counts for station badges
    const stationCounts = useMemo(() => {
        return {
            all: menuItems.length,
            grill: menuItems.filter(i => i.station === 'grill').length,
            finishing: menuItems.filter(i => i.station === 'finishing').length,
            beverage: menuItems.filter(i => i.station === 'beverage').length,
            hunger: menuItems.filter(i => i.statType === 'hunger').length,
            thirst: menuItems.filter(i => i.statType === 'thirst').length,
        };
    }, [menuItems]);

    return (
        <section id="menu" className="py-24 relative bg-[#050505] text-white overflow-hidden">
            {/* Subtle Gold Grid Accent */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.02]"
                style={{
                    backgroundImage: 'linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }}
            />

            <div className="container px-4 md:px-8 mx-auto relative z-10 max-w-[1600px]">
                {/* Section Header */}
                <div className="flex flex-col items-center mb-12 space-y-3">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 text-[#D4AF37]"
                    >
                        <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-[#D4AF37]" />
                        <span className="font-bold tracking-[0.35em] uppercase text-xs md:text-sm font-sans">
                            Culinary Excellence & Prestige
                        </span>
                        <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-[#D4AF37]" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center text-center"
                    >
                        <h2 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2B2] via-[#D4AF37] to-[#AA8222] filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] pb-1">
                            GM CAFE
                        </h2>
                        <h3 className="text-xl md:text-3xl font-bold tracking-[0.2em] uppercase text-white/90 mt-1">
                            OUR MENU
                        </h3>
                        <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto mt-2">
                            Fresh ingredients, handcrafted recipes, and exceptional taste prepared daily.
                        </p>
                    </motion.div>
                </div>

                {/* Filter Bar: Stations + Search + Stats */}
                <div className="bg-[#111113] border border-[#D4AF37]/30 rounded-2xl p-4 md:p-6 mb-10 shadow-2xl backdrop-blur-xl">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        {/* Station Filter Buttons */}
                        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                            <button
                                onClick={() => setSelectedStation('all')}
                                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                                    selectedStation === 'all'
                                        ? 'bg-[#D4AF37] text-black shadow-md'
                                        : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700/80 hover:text-white'
                                }`}
                            >
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                                <span>All Dishes ({stationCounts.all})</span>
                            </button>

                            <button
                                onClick={() => setSelectedStation('grill')}
                                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                                    selectedStation === 'grill'
                                        ? 'bg-[#c1785b] text-white shadow-md'
                                        : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700/80 hover:text-white'
                                }`}
                            >
                                <Flame className="w-3.5 h-3.5" />
                                <span>Cook & Grill ({stationCounts.grill})</span>
                            </button>

                            <button
                                onClick={() => setSelectedStation('finishing')}
                                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                                    selectedStation === 'finishing'
                                        ? 'bg-[#ad875c] text-white shadow-md'
                                        : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700/80 hover:text-white'
                                }`}
                            >
                                <Utensils className="w-3.5 h-3.5" />
                                <span>Finishing Station ({stationCounts.finishing})</span>
                            </button>

                            <button
                                onClick={() => setSelectedStation('beverage')}
                                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                                    selectedStation === 'beverage'
                                        ? 'bg-[#366a95] text-white shadow-md'
                                        : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700/80 hover:text-white'
                                }`}
                            >
                                <Wine className="w-3.5 h-3.5" />
                                <span>Beverages ({stationCounts.beverage})</span>
                            </button>
                        </div>

                        {/* Search and Stat Filter Right Side */}
                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
                            {/* Stat Quick Filter */}
                            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700/80 rounded-xl p-1">
                                <button
                                    onClick={() => setStatFilter('all')}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                        statFilter === 'all' ? 'bg-[#D4AF37] text-black font-bold' : 'text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setStatFilter('hunger')}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                                        statFilter === 'hunger' ? 'bg-orange-600/80 text-white font-bold' : 'text-zinc-400 hover:text-orange-300'
                                    }`}
                                >
                                    🍖 Hunger
                                </button>
                                <button
                                    onClick={() => setStatFilter('thirst')}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                                        statFilter === 'thirst' ? 'bg-blue-600/80 text-white font-bold' : 'text-zinc-400 hover:text-blue-300'
                                    }`}
                                >
                                    <Droplets className="w-3 h-3" /> Thirst
                                </button>
                            </div>

                            {/* Search Input */}
                            <div className="relative flex-grow sm:w-64">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search menu items..."
                                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-white text-xs md:text-sm focus:outline-none focus:border-[#D4AF37] placeholder:text-zinc-500 transition-colors"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu Items Grid */}
                {filteredItems.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-900/40 rounded-2xl border border-zinc-800">
                        <p className="text-zinc-400 text-lg">No menu items found matching your filters.</p>
                        <button
                            onClick={() => { setSelectedStation('all'); setStatFilter('all'); setSearchQuery(''); }}
                            className="mt-4 px-6 py-2 rounded-full bg-[#D4AF37] text-black font-semibold text-sm hover:bg-[#ffe066]"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
                        <AnimatePresence>
                            {filteredItems.map((item, index) => {
                                return (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.4) }}
                                        onClick={() => setSelectedItem(item)}
                                        className="group relative cursor-pointer flex flex-col justify-between rounded-xl overflow-hidden bg-[#141416] hover:bg-[#1c1c20] border border-zinc-800 hover:border-[#D4AF37]/60 transition-all duration-300 shadow-lg hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:-translate-y-1"
                                    >
                                        {/* Top Station Colored Accent Stripe */}
                                        <div
                                            className="w-full h-1.5 transition-all duration-300 group-hover:h-2"
                                            style={{ backgroundColor: item.stationColor }}
                                        />

                                        {/* Card Content */}
                                        <div className="p-4 flex flex-col items-center flex-grow">
                                            {/* Image Container */}
                                            <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-lg bg-[#0a0a0c] border border-zinc-800/80 group-hover:border-[#D4AF37]/40 transition-colors">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                    className="object-cover p-1 group-hover:scale-105 transition-transform duration-500 rounded-lg"
                                                />
                                                {/* Floating Tag */}
                                                <div className="absolute top-2 right-2 bg-black/85 backdrop-blur-md border border-[#D4AF37]/50 px-2 py-0.5 rounded text-[10px] text-[#D4AF37] font-semibold tracking-wider">
                                                    {item.tag}
                                                </div>

                                                {/* Station pill indicator on image bottom */}
                                                <div
                                                    className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider backdrop-blur-md"
                                                    style={{
                                                        backgroundColor: `${item.stationColor}dd`,
                                                        color: '#ffffff'
                                                    }}
                                                >
                                                    {item.station === 'grill' ? 'Cook / Grill' : item.station === 'finishing' ? 'Finishing' : 'Beverage'}
                                                </div>
                                            </div>

                                            {/* Item Name */}
                                            <div className="text-center w-full min-h-[40px] flex flex-col justify-center mb-2">
                                                <h4 className="text-sm font-bold text-white group-hover:text-[#FFF2B2] transition-colors line-clamp-2 leading-tight">
                                                    {item.name}
                                                </h4>
                                            </div>

                                            {/* Price & Stat Line */}
                                            <div className="w-full pt-2 pb-1 border-t border-zinc-800 flex items-center justify-between text-xs font-semibold">
                                                <span className="text-[#D4AF37] font-bold text-sm tracking-wide">
                                                    {item.priceFormatted}
                                                </span>
                                                <span className="text-zinc-400 flex items-center gap-1 font-mono text-[11px]">
                                                    <span>·</span>
                                                    <span className={item.statType === 'hunger' ? 'text-orange-400' : 'text-blue-400'}>
                                                        {item.statFormatted}
                                                    </span>
                                                </span>
                                            </div>

                                            {/* Short culinary description */}
                                            <p className="text-[11px] text-zinc-500 italic text-center line-clamp-2 mt-1 leading-snug">
                                                &quot;{item.description}&quot;
                                            </p>
                                        </div>

                                        {/* Bottom Hover Glow Accent */}
                                        <div
                                            className="w-full h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                            style={{ backgroundColor: item.stationColor }}
                                        />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

                {/* Bottom Station Legend */}
                <div className="mt-14 pt-8 border-t border-zinc-800/80 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-xs md:text-sm text-zinc-300">
                    <button
                        onClick={() => setSelectedStation(selectedStation === 'finishing' ? 'all' : 'finishing')}
                        className={`flex items-center gap-2.5 transition-colors ${selectedStation === 'finishing' ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <span className="w-3 h-3 rounded-full bg-[#ad875c] shadow-[0_0_8px_#ad875c]" />
                        <span>Finishing Station</span>
                    </button>
                    <button
                        onClick={() => setSelectedStation(selectedStation === 'grill' ? 'all' : 'grill')}
                        className={`flex items-center gap-2.5 transition-colors ${selectedStation === 'grill' ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <span className="w-3 h-3 rounded-full bg-[#c1785b] shadow-[0_0_8px_#c1785b]" />
                        <span>Cook & Grill Stages</span>
                    </button>
                    <button
                        onClick={() => setSelectedStation(selectedStation === 'beverage' ? 'all' : 'beverage')}
                        className={`flex items-center gap-2.5 transition-colors ${selectedStation === 'beverage' ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <span className="w-3 h-3 rounded-full bg-[#366a95] shadow-[0_0_8px_#366a95]" />
                        <span>Beverage Station</span>
                    </button>
                </div>
            </div>

            {/* Dish Detail Modal */}
            <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
                {selectedItem && (
                    <DialogContent className="max-w-2xl bg-[#0e0e11] border border-[#D4AF37]/40 text-white p-0 overflow-hidden shadow-2xl rounded-2xl">
                        <div
                            className="w-full h-2"
                            style={{ backgroundColor: selectedItem.stationColor }}
                        />

                        <div className="p-6 md:p-8">
                            <div className="grid md:grid-cols-2 gap-6 items-center">
                                {/* Image */}
                                <div className="relative aspect-square rounded-xl overflow-hidden bg-black/60 border border-zinc-700 shadow-inner">
                                    <Image
                                        src={selectedItem.image}
                                        alt={selectedItem.name}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-3 right-3 bg-black/85 backdrop-blur-md border border-[#D4AF37]/70 px-3 py-1 rounded text-xs text-[#D4AF37] font-bold">
                                        {selectedItem.tag}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex flex-col justify-between space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span
                                                className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded text-white"
                                                style={{ backgroundColor: selectedItem.stationColor }}
                                            >
                                                {selectedItem.stationLabel}
                                            </span>
                                        </div>

                                        <DialogTitle className="text-2xl md:text-3xl font-black text-white tracking-tight">
                                            {selectedItem.name}
                                        </DialogTitle>
                                    </div>

                                    <DialogDescription className="text-zinc-300 text-sm leading-relaxed">
                                        {selectedItem.description}
                                    </DialogDescription>

                                    {/* Stats and Price box */}
                                    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                                                Price
                                            </span>
                                            <span className="text-[#D4AF37] font-black text-2xl">
                                                {selectedItem.priceFormatted}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-zinc-400 capitalize flex items-center gap-1.5">
                                                    {selectedItem.statType === 'hunger' ? '🍖 Hunger Recovery' : '🥤 Thirst Quench'}
                                                </span>
                                                <span className={selectedItem.statType === 'hunger' ? 'text-orange-400 font-bold' : 'text-blue-400 font-bold'}>
                                                    {selectedItem.statFormatted}
                                                </span>
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${selectedItem.statValue}%`,
                                                        backgroundColor: selectedItem.statType === 'hunger' ? '#f97316' : '#3b82f6'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex items-center justify-between text-xs text-zinc-400">
                                        <span>Preparation Area:</span>
                                        <span className="font-semibold text-white">
                                            {selectedItem.station === 'grill' ? 'Cook / Grill / Stove' : selectedItem.station === 'finishing' ? 'Finishing Station' : 'Beverage Station'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                )}
            </Dialog>
        </section>
    );
}
