'use server';

import connectToDatabase from '@/lib/db';
import SalaryLog from '@/models/SalaryLog';
import Employee from '@/models/Employee';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/actions/log';

export async function logPayment(userId: string, amount: number, notes?: string) {
    try {
        const session = await auth();
        // Allow strictly admin or specific role if needed, currently admin only for safety
        if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'staff')) {
            throw new Error("Unauthorized: Access denied");
        }

        if (!amount || amount <= 0) throw new Error("Invalid amount");

        await connectToDatabase();

        // Verify employee exists
        const employee = await Employee.findOne({ userId });
        if (!employee) throw new Error("Employee not found");

        const processorId = session.user.id || session.user.email || 'System';

        await SalaryLog.create({
            userId,
            amount,
            processedBy: processorId,
            notes,
            date: new Date()
        });

        await logActivity('Salary Payment', `Paid $${amount} to ${employee.username} (${userId}). Note: ${notes || 'None'}`);
        revalidatePath('/dashboard');

        // LOG TO DISCORD
        const { sendReportToDiscord } = await import('@/actions/discord');
        const discordMessage = `**💰 Salary Payment Logged**\n\n**Employee**: ${employee.username}\n**Amount**: $${amount.toLocaleString()}\n**Note**: ${notes || 'N/A'}\n**Processed By**: ${session.user.name || session.user.email || 'Admin'}`;
        await sendReportToDiscord(discordMessage, 'Salary Log');

        return { success: true };
    } catch (error: any) {
        console.error('Log Payment Error:', error);
        return { success: false, error: error.message || 'Failed to log payment' };
    }
}

export async function getSalaryHistory(userId?: string) {
    try {
        await connectToDatabase();

        let query = {};
        if (userId) {
            query = { userId };
        }

        const history = await SalaryLog.find(query).sort({ date: -1 }).limit(50);
        return { success: true, data: JSON.parse(JSON.stringify(history)) };
    } catch (error: any) {
        console.error('Get Salary History Error:', error);
        return { success: false, error: 'Failed to fetch history' };
    }
}
