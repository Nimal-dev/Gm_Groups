'use server';

import connectToDatabase from '@/lib/db';
import BankTransaction from '@/models/BankTransaction';

interface BankLogFilter {
    type?: string; // 'TRANSFER', 'DEPOSIT', 'WITHDRAW', 'all'
    accountId?: string; // Fuzzy match on name or number
    dateRange?: { from: Date; to: Date };
}

export async function getBankLogs(filter: BankLogFilter) {
    try {
        await connectToDatabase();

        const query: any = {};

        // Filter by Transaction Type
        if (filter.type && filter.type !== 'all') {
            query.transactionType = filter.type;
        }

        // Filter by Account (Name or Number)
        // Optimized: Use Text Search for performance (Requires text index on schema)
        if (filter.accountId) {
            query.$text = { $search: filter.accountId };
        }

        // Filter by Date
        if (filter.dateRange?.from || filter.dateRange?.to) {
            query.date = {};
            if (filter.dateRange.from) {
                const from = new Date(filter.dateRange.from);
                from.setHours(0, 0, 0, 0);
                query.date.$gte = from;
            }
            if (filter.dateRange.to) {
                const to = new Date(filter.dateRange.to);
                to.setHours(23, 59, 59, 999);
                query.date.$lte = to;
            }
        }

        const logs = await BankTransaction.find(query)
            .sort({ date: -1 })
            .limit(500)
            .lean();

        // Calculate Stats for the current filtered view
        const stats = {
            totalIncome: logs
                .filter((l: any) => l.transactionType === 'DEPOSIT')
                .reduce((sum: number, l: any) => sum + l.amount, 0),
            totalExpense: logs
                .filter((l: any) => l.transactionType === 'WITHDRAW' || l.transactionType === 'TRANSFER')
                .reduce((sum: number, l: any) => sum + l.amount, 0),
            count: logs.length
        };

        return {
            success: true,
            logs: JSON.parse(JSON.stringify(logs)),
            stats
        };

    } catch (error: any) {
        console.error('Fetch Bank Logs Error:', error);
        return { success: false, error: error.message, logs: [], stats: { totalIncome: 0, totalExpense: 0, count: 0 } };
    }
}
