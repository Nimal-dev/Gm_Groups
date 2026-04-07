'use server';

import { auth } from '@/auth';
import { fetchBot } from '@/lib/bot-api';

export interface SalesLogItem {
    name: string;
    quantity: number;
    price: number;
}

export async function submitSalesLog(items: SalesLogItem[], discount: number, total: number) {
    const session = await auth();

    if (!session || !session.user) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const payload = {
            user: session.user.id,
            staffName: session.user.name || session.user.email || 'Unknown Staff',
            items: items,
            discount: discount,
            total: total
        };

        const response = await fetchBot('/api/sales-log', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to submit sales log to bot');
        }

        return { success: true, message: result.message };

    } catch (error: any) {
        console.error('Sales Log Error:', error);
        return { success: false, error: error.message || 'Failed to connect to bot' };
    }
}
