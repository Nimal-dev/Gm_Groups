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

// Function to send Duty Log Report
export async function sendDutyLogReport(dateRange: { from: Date, to: Date }) {
    try {
        await connectToDatabase();

        // 1. Fetch Logs (Reusing logic logic or direct query)
        // We need stats for ALL users in range
        const query: any = {};
        if (dateRange?.from) {
            const from = new Date(dateRange.from);
            from.setHours(0, 0, 0, 0);
            query.startTime = { ...query.startTime, $gte: from.getTime() };
        }
        if (dateRange?.to) {
            const to = new Date(dateRange.to);
            to.setHours(23, 59, 59, 999);
            query.startTime = { ...query.startTime, $lte: to.getTime() };
        }
        // Only valid logs
        query.isValid = true;

        const logs = await DutyLog.find(query).lean();

        if (logs.length === 0) {
            return { success: false, error: "No valid logs found in this range." };
        }

        // 2. Aggregate Data
        const userStats: Record<string, number> = {};

        logs.forEach((log: any) => {
            if (!userStats[log.username]) {
                userStats[log.username] = 0;
            }
            userStats[log.username] += (log.durationMs || 0);
        });

        // 3. Format Message
        const fromStr = dateRange.from.toLocaleDateString('en-GB');
        const toStr = dateRange.to.toLocaleDateString('en-GB');

        let message = `**Duty Log Report** (${fromStr} - ${toStr})\n\n`;

        // Sort by duration desc
        const sortedUsers = Object.entries(userStats).sort(([, a], [, b]) => b - a);

        sortedUsers.forEach(([username, durationMs]) => {
            const totalMinutes = Math.floor(durationMs / 60000);
            const h = Math.floor(totalMinutes / 60);
            const m = totalMinutes % 60;
            message += `**${username}**: ${h}h ${m}m\n`;
        });

        // 4. Send to Discord
        const { sendReportToDiscord } = await import('@/actions/discord');
        const result = await sendReportToDiscord(message, 'Duty Log Report');

        return result;

    } catch (error: any) {
        console.error("Send Duty Report Error:", error);
        return { success: false, error: error.message };
    }
}
