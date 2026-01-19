'use server';

import { logActivity } from '@/actions/log';
import { auth } from '@/auth';

export async function submitCateringRequest(data: {
    orgName: string;
    repName: string;
    eventDateStr: string;
    eventTime: string;
    items: string;
    club: string;
}) {
    const BOT_URL = process.env.BOT_API_URL || 'http://localhost:3000';
    const session = await auth();

    if (!session || !session.user) {
        return { success: false, error: 'You must be logged in to submit a request.' };
    }

    try {
        const response = await fetch(`${BOT_URL}/api/catering-request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...data,
                submittedBy: {
                    discordId: session.user.id,
                    username: session.user.name || session.user.email || 'Unknown'
                }
            }),
            cache: 'no-store'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to submit catering request');
        }

        await logActivity('Catering Request', `New Request from ${data.orgName} (${data.repName}). Event Date: ${data.eventDateStr}.`);
        return { success: true, message: result.message };
    } catch (error: any) {
        console.error('Catering Request Error:', error);
        return { success: false, error: error.message || 'Connection to bot failed.' };
    }
}

export async function getOrgMembers(orgName: string) {
    const BOT_URL = process.env.BOT_API_URL || 'http://localhost:3000';
    let roleParam = '';

    if (orgName === 'Scorp Events') roleParam = 'SCORP';
    else if (orgName === 'BM Events') roleParam = 'BM';
    else return { members: [] };

    try {
        const response = await fetch(`${BOT_URL}/api/members?role=${roleParam}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: 300 } // Cache for 5 minutes
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        return { members: result.members || [] };

    } catch (error) {
        console.error('Fetch Members Error:', error);
        return { members: [] };
    }
}
