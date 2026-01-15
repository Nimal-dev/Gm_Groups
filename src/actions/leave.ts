'use server';

import connectToDatabase from '@/lib/db';
import Leave from '@/models/Leave';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function createLeave(formData: {
    userId: string;
    username: string;
    startDate: Date;
    endDate: Date;
    reason?: string;
}) {
    try {
        await connectToDatabase();

        const { userId, username, startDate, endDate, reason } = formData;

        if (!userId || !username || !startDate || !endDate) {
            return { success: false, error: 'Missing required fields' };
        }

        // Validate dates
        if (startDate > endDate) {
            return { success: false, error: 'Start date cannot be after end date' };
        }

        const newLeave = new Leave({
            userId,
            username,
            startDate,
            endDate,
            reason
        });

        await newLeave.save();

        revalidateTag('dashboard-data');
        revalidatePath('/dashboard');

        return { success: true };

    } catch (error: any) {
        console.error('Create Leave Error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteLeave(leaveId: string) {
    try {
        await connectToDatabase();
        await Leave.findByIdAndDelete(leaveId);

        revalidateTag('dashboard-data');
        revalidatePath('/dashboard');

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
