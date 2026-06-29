'use server';

import connectToDatabase from '@/lib/db';
import BankTransaction from '@/models/BankTransaction';
import BankBalanceLog from '@/models/BankBalanceLog';
import { getLocalPeriodRange } from '@/lib/date-utils';
import { revalidatePath } from 'next/cache';

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
            const { start, end } = getLocalPeriodRange(filter.dateRange.from || new Date(), filter.dateRange.to || new Date());
            query.date = {};
            if (filter.dateRange.from) query.date.$gte = start;
            if (filter.dateRange.to) query.date.$lte = end;
        }

        // Parallel execution for count and data
        const [logs, totalCount] = await Promise.all([
            BankTransaction.find(query)
                .sort({ createdAt: -1 })
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
                                { $eq: ["$transactionType", "DEPOSIT"] },
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
                                        { $eq: ["$transactionType", "TRANSFER"] }
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

export async function getLatestCompanyBalance(accountNumber: string = '3571970372'): Promise<number> {
    await connectToDatabase();

    const balanceLog = await BankBalanceLog.findOne({ accountNumber })
        .sort({ date: -1, _id: -1 })
        .lean();

    if (balanceLog && typeof balanceLog.newBalance === 'number') {
        return balanceLog.newBalance;
    }

    const latestTx = await BankTransaction.findOne({
        accountNumber,
        newBalance: { $exists: true, $ne: null }
    })
        .sort({ date: -1, _id: -1 })
        .select('newBalance')
        .lean();

    if (latestTx && typeof latestTx.newBalance === 'number') {
        return latestTx.newBalance;
    }

    return 0;
}

export async function addManualTransaction(data: {
    accountName: string;
    accountNumber: string;
    transactionType: 'TRANSFER' | 'DEPOSIT' | 'WITHDRAW' | 'BALANCE_UPDATE';
    amount: number;
    memo?: string;
    date?: string;
    transferredTo?: string;
    transferredFrom?: string;
    newBalance?: number;
}) {
    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'staff')) {
            throw new Error('Unauthorized Access');
        }

        if (data.transactionType !== 'BALANCE_UPDATE' && (!data.amount || data.amount <= 0)) {
            throw new Error('Amount must be a positive number');
        }

        await connectToDatabase();

        const {
            accountName,
            accountNumber,
            transactionType,
            amount,
            memo = '',
            date,
            transferredTo,
            transferredFrom,
            newBalance: manualNewBalance
        } = data;

        const txDate = date ? new Date(date) : new Date();
        const txId = `MAN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const COMPANY_ACCOUNT_NUMBER = '3571970372';
        let calculatedNewBalance: number | undefined = undefined;

        if (accountNumber === COMPANY_ACCOUNT_NUMBER) {
            const oldBalance = await getLatestCompanyBalance(COMPANY_ACCOUNT_NUMBER);

            if (transactionType === 'BALANCE_UPDATE') {
                calculatedNewBalance = manualNewBalance !== undefined ? manualNewBalance : oldBalance;
            } else if (transactionType === 'DEPOSIT') {
                calculatedNewBalance = oldBalance + amount;
            } else if (transactionType === 'WITHDRAW' || transactionType === 'TRANSFER') {
                // Transfers and withdrawals are ALWAYS a debit from the KOI cafe account
                calculatedNewBalance = oldBalance - amount;
            }

            if (calculatedNewBalance !== undefined) {
                await BankBalanceLog.create({
                    messageId: `bal-man-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
                    accountNumber: COMPANY_ACCOUNT_NUMBER,
                    oldBalance: oldBalance,
                    newBalance: calculatedNewBalance,
                    date: txDate
                });
            }
        }

        await BankTransaction.create({
            transactionId: txId,
            accountName,
            accountNumber,
            transactionType,
            amount: transactionType === 'BALANCE_UPDATE' ? 0 : amount,
            memo,
            rawMessageId: txId,
            date: txDate,
            transferredTo,
            transferredFrom,
            newBalance: calculatedNewBalance
        });

        revalidatePath('/dashboard');
        revalidatePath('/portal/dashboard');

        return { success: true };
    } catch (error: any) {
        console.error('Add Manual Transaction Error:', error);
        return { success: false, error: error.message || 'Failed to add manual transaction' };
    }
}
