'use server';

import { logActivity } from '@/actions/log';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import CateringRequest from '@/models/CateringRequest';

export async function getCateringRequests() {
    try {
        await connectToDatabase();
        // Fetch Pending requests, sorted by newest first
        // Use .lean() for performance since we just need JSON
        const requests = await CateringRequest.find({ status: 'Pending' })
            .sort({ createdAt: -1 })
            .lean();

        // Serialize _id and dates
        const serializedRequests = requests.map((req: any) => ({
            ...req,
            _id: req._id.toString(),
            createdAt: req.createdAt ? new Date(req.createdAt).toISOString() : new Date().toISOString()
        }));

        return { success: true, requests: serializedRequests };
    } catch (error: any) {
        console.error('Fetch Requests Error (DB):', error);
        return { success: false, error: 'Failed to fetch requests from DB', requests: [] };
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
