'use server';

import { auth } from '@/auth';
import { fetchBot } from '@/lib/bot-api';

export async function getInventory() {
    const session = await auth();

    if (!session || !session.user) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const response = await fetchBot('/api/inventory', {
            method: 'GET',
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch inventory from bot');
        }

        return { success: true, items: result.items };

    } catch (error: any) {
        console.error('Get Inventory Error:', error);
        return { success: false, error: error.message || 'Failed to connect to bot' };
    }
}

export async function updateInventory(items: {itemName: string, newQuantity: number}[]) {
    const session = await auth();

    if (!session || !session.user) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const payload = {
            items,
            updatedBy: session.user.name || session.user.email || 'Unknown Staff'
        };

        const response = await fetchBot('/api/inventory/update', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to update inventory on bot');
        }

        return { success: true, message: result.message };

    } catch (error: any) {
        console.error('Update Inventory Error:', error);
        return { success: false, error: error.message || 'Failed to connect to bot' };
    }
}
