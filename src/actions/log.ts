'use server';

import { auth } from '@/auth';

export async function logActivity(action: string, details: string) {


    try {
        const session = await auth();
        const user = session?.user?.name || 'Anonymous';
        const role = session?.user?.role || 'Guest';

        const { fetchBot } = await import('@/lib/bot-api');
        const response = await fetchBot('/api/website-log', {
            method: 'POST',
            body: JSON.stringify({ action, user, details, role }),
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error(`Failed to log activity: ${response.statusText}`);
            return { success: false };
        }

        return { success: true };
    } catch (error) {
        console.error('Log Activity Error:', error);
        return { success: false };
    }
}
