'use server';

import { auth } from '@/auth';

export type FoodLogItems = Record<string, number>;

export async function submitPreparedFoodLog(items: FoodLogItems) {
    const session = await auth();

    if (!session || !session.user) {
        return { success: false, error: 'Unauthorized' };
    }

    const BOT_URL = process.env.BOT_API_URL || 'http://localhost:3000';

    try {
        const payload = {
            user: session.user.id,
            staffName: session.user.name || session.user.email || 'Unknown Staff',
            items: items
        };

        const response = await fetch(`${BOT_URL}/api/prepared-food-log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            cache: 'no-store'
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
