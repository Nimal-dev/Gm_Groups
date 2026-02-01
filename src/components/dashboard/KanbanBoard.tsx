'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon, ArrowRight, ArrowLeft } from 'lucide-react';
import type { Order } from './BulkOrderManager';

interface KanbanBoardProps {
    orders: Order[];
    onStatusUpdate: (order: Order, newStatus: string) => void;
    onViewDetails: (order: Order) => void;
}

const COLUMN_DEFS = [
    { id: 'Pending', label: 'Pending', color: 'bg-orange-500/10 border-orange-500/20 text-orange-400' },
    { id: 'In Progress', label: 'In Progress', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
    { id: 'Ready', label: 'Ready', color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' },
    { id: 'Completed', label: 'Completed', color: 'bg-green-500/10 border-green-500/20 text-green-400' }
] as const;

export function KanbanBoard({ orders, onStatusUpdate, onViewDetails }: KanbanBoardProps) {

    // Memoize the grouping of orders to avoid re-filtering 4 times per render
    const columns = useMemo(() => {
        const groups: Record<string, Order[]> = {
            'Pending': [],
            'In Progress': [],
            'Ready': [],
            'Completed': []
        };

        orders.forEach(order => {
            if (groups[order.status]) {
                groups[order.status].push(order);
            }
        });

        return COLUMN_DEFS.map(col => ({
            ...col,
            items: groups[col.id] || []
        }));
    }, [orders]);

    const getNextStatus = (current: string) => {
        const idx = COLUMN_DEFS.findIndex(c => c.id === current);
        if (idx < COLUMN_DEFS.length - 1) return COLUMN_DEFS[idx + 1].id;
        return null;
    };

    const getPrevStatus = (current: string) => {
        const idx = COLUMN_DEFS.findIndex(c => c.id === current);
        if (idx > 0) return COLUMN_DEFS[idx - 1].id;
        return null;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full min-h-[600px]">
            {columns.map(col => (
                <div key={col.id} className={`flex flex-col rounded-xl border border-white/5 bg-black/20 overflow-hidden h-full`}>
                    <div className={`p-3 border-b border-white/5 font-bold flex items-center justify-between ${col.color.replace('bg-', 'text-').split(' ')[2]}`}>
                        <span>{col.label}</span>
                        <Badge variant="secondary" className="bg-black/40 text-xs">
                            {col.items.length}
                        </Badge>
                    </div>
                    <ScrollArea className="flex-1 p-2">
                        <div className="space-y-3">
                            {col.items.map(order => (
                                <div
                                    key={order.orderId}
                                    className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 transition-all group relative"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-mono text-xs text-muted-foreground">#{order.orderId}</span>
                                        <span className="text-xs font-bold text-white/50">{order.amount}</span>
                                    </div>
                                    <h4 className="font-bold text-sm mb-1 truncate" title={order.customer}>{order.customer}</h4>
                                    <div className="text-[10px] text-muted-foreground space-y-1 mb-3">
                                        <div className="flex items-center gap-1">
                                            <CalendarIcon className="w-3 h-3" />
                                            {order.eventDate ? new Date(order.eventDate).toLocaleDateString('en-GB') : order.deliveryDate}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {getPrevStatus(col.id) ? (
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onStatusUpdate(order, getPrevStatus(col.id)!)}>
                                                <ArrowLeft className="w-3 h-3" />
                                            </Button>
                                        ) : <div className="w-6" />}

                                        <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => onViewDetails(order)}>
                                            View
                                        </Button>

                                        {getNextStatus(col.id) ? (
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onStatusUpdate(order, getNextStatus(col.id)!)}>
                                                <ArrowRight className="w-3 h-3" />
                                            </Button>
                                        ) : <div className="w-6" />}
                                    </div>
                                </div>
                            ))}
                            {col.items.length === 0 && (
                                <div className="text-center py-10 text-xs text-muted-foreground/50 italic">
                                    Empty
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            ))}
        </div>
    );
}
