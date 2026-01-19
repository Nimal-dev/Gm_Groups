'use server';

import { logActivity } from '@/actions/log';
import { auth } from '@/auth';

export async function getCateringRequests() {
    const BOT_URL = process.env.BOT_API_URL || 'http://localhost:3000';
    try {
        const response = await fetch(`${BOT_URL}/api/catering-requests`, {
            method: 'GET',
            cache: 'no-store'
        });

        if (!response.ok) throw new Error('Failed to fetch requests');
        const data = await response.json();
        return { success: true, requests: data.requests || [] };
    } catch (error: any) {
        console.error('Fetch Requests Error:', error);
        return { success: false, error: 'Failed to connect to Bot API', requests: [] };
    }
}

export async function processCateringRequest(requestId: string, action: 'accept' | 'decline', reason?: string) {
    const session = await auth();
    if (!session || !session.user) return { success: false, error: 'Unauthorized' };

    const BOT_URL = process.env.BOT_API_URL || 'http://localhost:3000';
    try {
        const response = await fetch(`${BOT_URL}/api/catering-request/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requestId,
                action,
                user: session.user.name || 'Unknown Staff',
                reason
            }),
            cache: 'no-store'
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to process request');

        await logActivity(
            action === 'accept' ? 'Accept Catering Request' : 'Decline Catering Request',
            `${action === 'accept' ? 'Accepted' : 'Declined'} request ID ${requestId}. ${reason ? `Reason: ${reason}` : ''}`
        );

        return { success: true, message: data.message };
    } catch (error: any) {
        console.error('Process Request Error:', error);
        return { success: false, error: error.message || 'Failed to process request' };
    }
}
