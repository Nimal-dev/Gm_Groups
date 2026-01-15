'use server';

import connectToDatabase from '@/lib/db';
import DutyLog from '@/models/DutyLog';

export async function getDutyLogs(userId: string | null, dateRange?: { from: Date, to: Date }) {
    try {
        await connectToDatabase();

        const query: any = {};

        if (userId && userId !== 'all') {
            query.userId = userId;
        }

        if (dateRange?.from || dateRange?.to) {
            query.startTime = {};
            if (dateRange.from) {
                // Ensure beginning of day
                const from = new Date(dateRange.from);
                from.setHours(0, 0, 0, 0);
                query.startTime.$gte = from.getTime();
            }
            if (dateRange.to) {
                // Ensure end of day
                const to = new Date(dateRange.to);
                to.setHours(23, 59, 59, 999);
                // We use startTime for the range check as that represents the shift date usually
                query.startTime.$lte = to.getTime();
            }
        }

        // Limit results to prevent massive payloads if no filters
        const limit = (userId || dateRange) ? 500 : 100;

        const logs = await DutyLog.find(query)
            .sort({ startTime: -1 })
            .limit(limit)
            .lean();

        return { success: true, logs: JSON.parse(JSON.stringify(logs)) };

    } catch (error: any) {
        console.error('Fetch Logs Error:', error);
        return { success: false, error: error.message, logs: [] };
    }
}
