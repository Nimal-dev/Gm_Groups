'use server';

import connectToDatabase from '@/lib/db';
import BankTransaction from '@/models/BankTransaction';
import Employee from '@/models/Employee';
import SalaryLog from '@/models/SalaryLog';
import BankBalanceLog from '@/models/BankBalanceLog';
import { fetchBot } from '@/lib/bot-api';

interface ReportData {
    startDate: string;
    endDate: string;
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    membersAdded: number;
    membersRemoved: number; // Placeholder
}

export interface FullReportData {
    startDate: string;
    endDate: string;
    financials: {
        openingBalance: number;
        closingBalance: number;
        totalIncome: number;
        totalExpense: number;
        totalSalaries: number;
        netProfit: number;
    };
    inventory: { itemName: string; quantity: number }[];
    hr: {
        membersAdded: number;
        membersRemoved: number;
        totalEmployees: number;
    };
    recentTransactions: any[];
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
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                totalIncome,
                totalExpense,
                netProfit,
                membersAdded: employeesAdded,
                membersRemoved: 0 // System does not track removal date yet
            }
        };
    } catch (error: any) {
        console.error('Report Generation Error:', error);
        return { success: false, error: 'Failed to generate report data.' };
    }
}

export async function generateFullShopReportData(startDate: Date, endDate: Date): Promise<{ success: boolean; data?: FullReportData; error?: string }> {
    try {
        await connectToDatabase();

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return { success: false, error: 'Invalid Date Range.' };
        }
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        // 1. Bank Balances (Opening/Closing)
        // Find the log closest to start date (opening)
        const openingLog = await BankBalanceLog.findOne({
            date: { $lte: start }
        }).sort({ date: -1 }).lean();

        // Find the log closest to end date (closing)
        const closingLog = await BankBalanceLog.findOne({
            date: { $lte: end }
        }).sort({ date: -1 }).lean();

        const openingBalance = openingLog?.newBalance || 0;
        const closingBalance = closingLog?.newBalance || 0;

        // 2. Transactions (Income/Expense)
        const transactions = await BankTransaction.find({
            date: { $gte: start, $lte: end }
        }).sort({ date: -1 }).lean();

        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach((t: any) => {
            const isTransferOut = t.transactionType === 'TRANSFER' && (
                t.memo && t.memo.toLowerCase().includes('transfer to')
            );
            if (t.transactionType === 'WITHDRAW' || isTransferOut) {
                totalExpense += t.amount;
            } else {
                totalIncome += t.amount;
            }
        });

        // 3. Salary Logs
        const salaryLogs = await SalaryLog.find({
            date: { $gte: start, $lte: end }
        }).lean();
        const totalSalaries = salaryLogs.reduce((sum, log) => sum + log.amount, 0);

        // 4. Inventory (from Bot API)
        let inventoryItems = [];
        try {
            const invResponse = await fetchBot('/api/inventory');
            if (invResponse.ok) {
                const invData = await invResponse.json();
                inventoryItems = invData.items || [];
            }
        } catch (e) {
            console.error("Failed to fetch inventory for report:", e);
        }

        // 5. HR Metrics
        const membersAdded = await Employee.countDocuments({ joinedAt: { $gte: start, $lte: end } });
        const totalEmployees = await Employee.countDocuments();

        return {
            success: true,
            data: {
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                financials: {
                    openingBalance,
                    closingBalance,
                    totalIncome,
                    totalExpense,
                    totalSalaries,
                    netProfit: totalIncome - totalExpense - totalSalaries
                },
                inventory: inventoryItems,
                hr: {
                    membersAdded,
                    membersRemoved: 0,
                    totalEmployees
                },
                recentTransactions: transactions.slice(0, 10) // Top 10 for the report
            }
        };

    } catch (error: any) {
        console.error('Full Report Generation Error:', error);
        return { success: false, error: 'Failed to generate full shop report data.' };
    }
}
