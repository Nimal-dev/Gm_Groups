'use server';

import { auth } from '@/auth';

export async function logActivity(action: string, details: string) {
    const BOT_URL = process.env.BOT_API_URL || 'http://localhost:3000';

    try {
        const session = await auth();
        const user = session?.user?.name || 'Anonymous';
        const role = session?.user?.role || 'Guest';

        const response = await fetch(`${BOT_URL}/api/website-log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
