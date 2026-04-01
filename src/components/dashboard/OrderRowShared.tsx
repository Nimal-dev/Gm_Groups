'use client';

import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

export function getStatusStyles(status: string) {
    if (['Ready', 'Completed'].includes(status)) {
        return { badge: 'border-green-500 text-green-400 bg-green-500/10' };
    }
    if (['In Progress', 'Processing'].includes(status)) {
        return { badge: 'border-blue-500 text-blue-400 bg-blue-500/10' };
    }
    if (['Pending', 'Waiting', 'Confirmed'].includes(status)) {
        return { badge: 'border-orange-500 text-orange-400 bg-orange-500/10' };
    }
    return { badge: 'border-gray-500 text-gray-400 bg-gray-500/10' };
}

interface OrderRowProps {
    order: any;
    detailed?: boolean;
}

export function OrderRow({ order, detailed }: OrderRowProps) {
    const statusStyles = getStatusStyles(order.status);

    return (
        <div className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 w-full text-start">
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className={`${statusStyles.badge} border transition-colors whitespace-nowrap`}>
                            {order.status}
                        </Badge>
                        <span className="font-bold text-lg text-green-400 font-mono">{order.amount}</span>
                        {detailed && order.isManual === false && <Badge variant="secondary" className="text-[10px] h-5">Automated</Badge>}
                    </div>

                    <div className="mb-2">
                        <h4 className="font-bold text-lg">{order.customer}</h4>
                        <p className="text-xs text-muted-foreground">Order #{order.orderId}</p>
                    </div>

                    {/* Extended Details Grid */}
                    {detailed && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3 p-2 rounded bg-black/20 border border-white/5 text-xs">
                            <div>
                                <span className="text-muted-foreground block text-[10px]">Event Date</span>
                                <span className="font-mono">{order.eventDate || order.deliveryDate || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-[10px]">Collection</span>
                                <span className="font-mono">{order.collectionDate || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-[10px]">Surcharge</span>
                                <span className={order.surcharge && order.surcharge !== 'None' ? "text-orange-400 font-mono" : "font-mono"}>
                                    {order.surcharge || 'None'}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-[10px]">Representative</span>
                                <span className="truncate block font-medium" title={order.representative}>{order.representative || 'Unknown'}</span>
                            </div>
                        </div>
                    )}

                    {/* Order Items / Details */}
                    {(detailed || order.details) && (
                        <div className="w-full bg-black/30 p-3 rounded-md border border-white/5 text-sm font-mono text-muted-foreground whitespace-pre-wrap">
                            {order.details}
                        </div>
                    )}
                </div>

                <div className="text-right flex flex-col items-end gap-1 min-w-[120px]">
                    <div className="flex items-center gap-1 text-accent">
                        <Clock className="w-3 h-3" />
                        <span className="text-sm font-medium">{order.deliveryDate || order.eventDate}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
