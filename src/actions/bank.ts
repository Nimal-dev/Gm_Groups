'use server';

import connectToDatabase from '@/lib/db';
import BankTransaction from '@/models/BankTransaction';

interface BankLogFilter {
    type?: string;
    accountId?: string;
    dateRange?: { from: Date; to: Date };
    page?: number;
    pageSize?: number;
}

import { auth } from '@/auth';

export async function getBankLogs(filter: BankLogFilter) {
    try {
        const session = await auth();
        if (!session?.user) {
            throw new Error('Unauthorized Access');
        }

        await connectToDatabase();

        const query: any = {};
        const page = filter.page || 1;
        const limit = filter.pageSize || 20;
        const skip = (page - 1) * limit;

        // Filter by Transaction Type
        if (filter.type && filter.type !== 'all') {
            query.transactionType = filter.type;
        }

        // Filter by Account (Name or Number)
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

        // Parallel execution for count and data
        const [logs, totalCount] = await Promise.all([
            BankTransaction.find(query)
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            BankTransaction.countDocuments(query)
        ]);

        // Optimized Serialization (Manual mapping is faster than JSON.parse/stringify)
        const serializedLogs = logs.map((log: any) => ({
            ...log,
            _id: log._id.toString(),
            date: log.date?.toISOString(),
            createdAt: log.createdAt?.toISOString()
        }));

        // Calculate Stats (Note: Stats should probably be a separate call if they need to be global, 
        // but here we might want stats based on the query. If we paginate, summing ONLY the page is wrong. 
        // We probably want stats for the WHOLE matched set. 
        // Calculating sums on the whole set can be expensive if the set is huge.
        // For efficiency, we will fetch stats separately via aggregation if needed, or just return basic counts.)

        // For now, let's do a fast aggregation for totals matching the query
        // This makes it 2 DB calls instead of 1 but prevents fetching 5000 docs into memory.
        const statsAggregation = await BankTransaction.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalIncome: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ["$transactionType", "DEPOSIT"] },
                                        {
                                            $and: [
                                                { $eq: ["$transactionType", "TRANSFER"] },
                                                // Only consider INCOMING if it does NOT have "transfer to"
                                                { $eq: [{ $indexOfCP: [{ $toLower: { $ifNull: ["$memo", ""] } }, "transfer to"] }, -1] }
                                            ]
                                        }
                                    ]
                                },
                                "$amount",
                                0
                            ]
                        }
                    },
                    totalExpense: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ["$transactionType", "WITHDRAW"] },
                                        {
                                            $and: [
                                                { $eq: ["$transactionType", "TRANSFER"] },
                                                // Only consider OUTGOING if it HAS "transfer to"
                                                { $ne: [{ $indexOfCP: [{ $toLower: { $ifNull: ["$memo", ""] } }, "transfer to"] }, -1] }
                                            ]
                                        }
                                    ]
                                },
                                "$amount",
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const stats = statsAggregation[0] || { totalIncome: 0, totalExpense: 0 };

        return {
            success: true,
            logs: serializedLogs,
            stats: {
                ...stats,
                count: totalCount
            },
            pagination: {
                page,
                pageSize: limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        };

    } catch (error: any) {

        return {
            success: false,
            error: error.message,
            logs: [],
            stats: { totalIncome: 0, totalExpense: 0, count: 0 },
            pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 }
        };
    }
}
