'use server';

import { auth } from '@/auth';
import { fetchBot } from '@/lib/bot-api';

export type FoodLogItems = Record<string, number>;

export async function submitPreparedFoodLog(items: FoodLogItems) {
    const session = await auth();

    if (!session || !session.user) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const payload = {
            user: session.user.id,
            staffName: session.user.name || session.user.email || 'Unknown Staff',
            items: items
        };

        const response = await fetchBot('/api/prepared-food-log', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to submit log to bot');
        }

        return { success: true, message: result.message };

    } catch (error: any) {
        console.error('Prepared Food Log Error:', error);
        return { success: false, error: error.message || 'Failed to connect to bot' };
    }
}
