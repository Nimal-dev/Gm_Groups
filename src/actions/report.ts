'use server';

import connectToDatabase from '@/lib/db';
import BankTransaction from '@/models/BankTransaction';
import Employee from '@/models/Employee';

interface ReportData {
    startDate: string;
    endDate: string;
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    membersAdded: number;
    membersRemoved: number; // Placeholder
}

export async function generateReportData(startDate: Date, endDate: Date): Promise<{ success: boolean; data?: ReportData; error?: string }> {
    try {
        await connectToDatabase();

        // Ensure dates are valid Date objects (handling strings if passed)
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return { success: false, error: 'Invalid Date Range provided.' };
        }

        // Set Time to start/end of day
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        // Fetch Bank Transactions
        const bankParams = {
            date: { $gte: start, $lte: end }
        };

        const transactions = await BankTransaction.find(bankParams).lean();

        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach((t: any) => {
            // Expenses: WITHDRAW or TRANSFER (Outgoing to someone)
            // Check 'memo' string for "transfer to". Ignore 'transferredTo' field as it might exist for incoming too.
            const isTransferOut = t.transactionType === 'TRANSFER' && (
                t.memo && t.memo.toLowerCase().includes('transfer to')
            );

            if (t.transactionType === 'WITHDRAW' || isTransferOut) {
                totalExpense += t.amount;
            } else {
                // Income: DEPOSIT or TRANSFER (Incoming/Internal without specific destination)
                totalIncome += t.amount;
            }
        });

        const netProfit = totalIncome - totalExpense;

        // Fetch Members Added
        const employeesAdded = await Employee.countDocuments({
            joinedAt: { $gte: start, $lte: end }
        });

        return {
            success: true,
            data: {
                startDate: start.toLocaleDateString(),
                endDate: end.toLocaleDateString(),
                totalIncome,
                totalExpense,
                netProfit,
                membersAdded: employeesAdded,
                membersRemoved: 0 // System does not track removal date yet
            }
        };
    } catch (error: any) {
        console.error('Report Generation Error:', error);
        return { success: false, error: error.message || 'Failed to generate report data' };
    }
}
