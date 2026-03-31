'use server';

import { logActivity } from '@/actions/log';

export async function submitRawRequest(data: {
    ingameName: string;
    partner: string;
    urgency: string;
    items: string;
    datetime: string;
    notes?: string;
}) {
    const { fetchBot } = await import('@/lib/bot-api');

    try {
        const response = await fetchBot('/api/raw-request', {
            method: 'POST',
            body: JSON.stringify(data),
            cache: 'no-store'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to submit raw materials request');
        }

        await logActivity('Raw Materials Request', `New Request from ${data.ingameName} to ${data.partner}. Urgency: ${data.urgency}.`);
        return { success: true, message: result.message };
    } catch (error: any) {
        console.error('Raw Request Error:', error);
        return { success: false, error: 'Something went wrong. Please try again later.' };
    }
}
