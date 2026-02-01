'use server';

import { auth } from '@/auth';
import { revalidateTag } from 'next/cache';
import { logActivity } from '@/actions/log';

const BOT_URL = process.env.BOT_API_URL || 'http://localhost:3000';

export async function createCitizenOrder(data: { to: string, amount: string, eventDate: string, details: string }) {
    const session = await auth();
    const user = session?.user;

    if (!user) return { success: false, error: 'Unauthorized' };

    try {
        const payload = {
            ...data,
            repName: user.name || 'Web User'
        };

        const { fetchBot } = await import('@/lib/bot-api');
        const res = await fetchBot('/api/bulk-order/citizen', {
            method: 'POST',
            body: JSON.stringify(payload),
            cache: 'no-store'
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to create order');

        revalidateTag('dashboard-data'); // Force refresh
        await logActivity('Create Citizen Order', `Created Citizen Order #${result.orderId} for ${data.to}. Amount: ${data.amount}`);
        return { success: true, message: result.message, orderId: result.orderId };
    } catch (error: any) {
        console.error('Create Citizen Order Error:', error);
        return { success: false, error: error.message };
    }
}

export async function createRecurringOrder(data: { customer: string, clientRep?: string, securityDeposit?: number, items: string, amount: string, startDate: string, intervalDays: number, deliveryDetails: string }) {
    const session = await auth();
    const user = session?.user;

    // Strict Role Check? Backend checks role too if strictly needed, but here we assume access to UI implies permission.
    if (!user) return { success: false, error: 'Unauthorized' };

    try {
        const payload = {
            ...data,
            creatorName: user.name || 'Web User'
        };

        const { fetchBot } = await import('@/lib/bot-api');
        const res = await fetchBot('/api/bulk-order/recurring', {
            method: 'POST',
            body: JSON.stringify(payload),
            cache: 'no-store'
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to create contract');

        revalidateTag('dashboard-data'); // Force refresh
        await logActivity('Create Recurring Order', `Created Recurring Order for ${data.customer}. Deposit: ${data.securityDeposit || 0}`);
        return { success: true, message: result.message };
    } catch (error: any) {
        console.error('Create Recurring Order Error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateOrderStatus(orderId: string | number, messageId: string, channelId: string, status: string, reason?: string) {
    const session = await auth();
    const user = session?.user;

    if (!user) return { success: false, error: 'Unauthorized' };

    try {
        const payload = {
            orderId, // Might be number or string
            messageId,
            channelId,
            status,
            reason,
            updatedBy: user.name || 'Web User'
        };

        const { fetchBot } = await import('@/lib/bot-api');
        const res = await fetchBot('/api/bulk-order/status', {
            method: 'POST',
            body: JSON.stringify(payload),
            cache: 'no-store'
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to update status');

        revalidateTag('dashboard-data'); // Force refresh
        await logActivity('Update Order Status', `Updated Order #${orderId} to status: ${status}. Reason: ${reason || 'N/A'}`);
        return { success: true, message: result.message };
    } catch (error: any) {
        console.error('Update Status Error:', error);
        return { success: false, error: error.message };
    }
}

export async function endRecurringOrder(contractId: string) {
    const session = await auth();
    const user = session?.user;

    if (!user) return { success: false, error: 'Unauthorized' };

    try {
        const payload = {
            contractId,
            endedBy: user.name || 'Web User'
        };

        const { fetchBot } = await import('@/lib/bot-api');
        const res = await fetchBot('/api/bulk-order/recurring/end', {
            method: 'POST',
            body: JSON.stringify(payload),
            cache: 'no-store'
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to end contract');

        revalidateTag('dashboard-data'); // Force refresh
        await logActivity('End Recurring Contract', `Ended Recurring Contract ${contractId}.`);
        return { success: true, message: result.message };
    } catch (error: any) {
        console.error('End Recurring Order Error:', error);
        return { success: false, error: error.message };
    }
}
