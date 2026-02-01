'use server';

import { logActivity } from '@/actions/log';

export async function submitCateringRequest(data: {
    orgName: string;
    repName: string;
    eventDateStr: string;
    eventTime: string;
    items: string;
    club: string;
}) {
    const { fetchBot } = await import('@/lib/bot-api');

    try {
        const response = await fetchBot('/api/catering-request', {
            method: 'POST',
            body: JSON.stringify(data),
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
    const { fetchBot } = await import('@/lib/bot-api');
    let roleParam = '';

    if (orgName === 'Scorp Events') roleParam = 'SCORP';
    else if (orgName === 'BM Events') roleParam = 'BM';
    else return { members: [] };

    try {
        const response = await fetchBot(`/api/members?role=${roleParam}`, {
            method: 'GET',
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
