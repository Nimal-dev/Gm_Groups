'use server';

import connectToDatabase from '@/lib/db';
import BankTransaction from '@/models/BankTransaction';
import Employee from '@/models/Employee';
import SalaryLog from '@/models/SalaryLog';
import BankBalanceLog from '@/models/BankBalanceLog';
import DutyLog from '@/models/DutyLog';
import SalesLog from '@/models/SalesLog';
import { fetchBot } from '@/lib/bot-api';
import Groq from 'groq-sdk';

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
    allTransactions: any[];
    allSalaries: any[];
    dutyLogs: any[];
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

        // 6. Duty Logs
        const dutyLogs = await DutyLog.find({
            startTime: { $gte: start.getTime(), $lte: end.getTime() }
        }).sort({ startTime: -1 }).lean();

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
                allTransactions: transactions,
                allSalaries: salaryLogs,
                dutyLogs
            }
        };

    } catch (error: any) {
        console.error('Full Report Generation Error:', error);
        return { success: false, error: 'Failed to generate full shop report data.' };
    }
}

export interface SalesReportData {
    startDate: string;
    endDate: string;
    itemsReport: { name: string; quantity: number; subtotal: number }[];
    totalSalesAmount: number;
    avgSalesPerDay: number;
    avgAmountPerDay: number;
    totalUptimeMs: number;
    avgUptimePerDayMs: number;
    aiAnalysis: string;
}

export async function generateSalesReportData(startDate: Date, endDate: Date): Promise<{ success: boolean; data?: SalesReportData; error?: string }> {
    try {
        await connectToDatabase();

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return { success: false, error: 'Invalid Date Range provided.' };
        }
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        // Optimize for Free Tier: Use MongoDB Aggregation instead of in-memory maps
        const salesStats = await SalesLog.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: null,
                    totalSalesAmount: { $sum: "$total" },
                    totalTransactions: { $sum: 1 },
                    items: { $push: "$items" }
                }
            }
        ]);

        let totalSalesAmount = 0;
        let totalTransactions = 0;
        let itemTracker: Record<string, { quantity: number; subtotal: number }> = {};

        if (salesStats.length > 0) {
            totalSalesAmount = salesStats[0].totalSalesAmount;
            totalTransactions = salesStats[0].totalTransactions;
            
            // Unwind nested items to aggregate (done in JS here as size of unique items is small and easier on M0 cluster CPU limits for complex unwinds)
            salesStats[0].items.flat().forEach((item: any) => {
                if (!itemTracker[item.name]) {
                    itemTracker[item.name] = { quantity: 0, subtotal: 0 };
                }
                itemTracker[item.name].quantity += item.quantity;
                itemTracker[item.name].subtotal += (item.price * item.quantity);
            });
        }

        // Calculate days span
        const MS_PER_DAY = 1000 * 60 * 60 * 24;
        const daysCount = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / MS_PER_DAY));

        const itemsReport = Object.keys(itemTracker).map(name => ({
            name,
            quantity: itemTracker[name].quantity,
            subtotal: itemTracker[name].subtotal
        })).sort((a, b) => b.quantity - Math.max(a.quantity, 0));

        const avgSalesPerDay = totalTransactions / daysCount;
        const avgAmountPerDay = totalSalesAmount / daysCount;

        // Optimize DutyLogs with aggregation
        const dutyStats = await DutyLog.aggregate([
            { $match: { startTime: { $gte: start.getTime(), $lte: end.getTime() } } },
            {
                $group: {
                    _id: null,
                    totalUptimeMs: { $sum: "$durationMs" },
                    uniqueDays: {
                        $addToSet: {
                            $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$startTime" } }
                        }
                    }
                }
            }
        ]);

        const totalUptimeMs = dutyStats.length > 0 ? dutyStats[0].totalUptimeMs : 0;
        const openDaysCount = dutyStats.length > 0 ? Math.max(1, dutyStats[0].uniqueDays.length) : 1;
        const avgUptimePerDayMs = totalUptimeMs / openDaysCount;

        // AI Analysis
        let aiAnalysisText = "";
        try {
            const formatMins = (ms: number) => Math.round(ms / 60000);
            const prompt = `Analyze the following sales data for a coffee/food shop from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}.
Data:
- Total Sales Amount: $${totalSalesAmount.toLocaleString()}
- Average Daily Sales Count (Transactions): ${avgSalesPerDay.toFixed(1)}
- Average Daily Revenue: $${avgAmountPerDay.toLocaleString()}
- Total Shop Uptime: ${formatMins(totalUptimeMs)} minutes
- Average Daily Open Time: ${formatMins(avgUptimePerDayMs)} minutes
- Top Items Sold:
${itemsReport.slice(0, 10).map(i => `  * ${i.name}: ${i.quantity} units ($${i.subtotal})`).join('\n')}

Business Strategies Context:
- In-restaurant sales (walk-ins)
- Bulk orders for governments, clubs, and families.
- Customer acquisition teams actively out acquiring customers.

Task:
Write a highly positive, professional Markdown report emphasizing the success of this period. Focus ONLY on the good outcomes and achievements. Since this is an official report, frame the metrics as a direct result of our highly effective strategies (in-restaurant, bulk, and acquisition teams). Even if the numbers are low, praise the operational consistency, uptime, and the hard work of the team. Do NOT mention any missing data, inaccuracies, low performance, or loopholes. Produce a polished 2-3 paragraph presentation that highlights this period as a definitive success.`;

            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
            });
            aiAnalysisText = completion.choices[0]?.message?.content || "AI Analysis unavailable.";
        } catch (aiErr) {
            console.error("AI Generation Error:", aiErr);
            aiAnalysisText = "AI Analysis is currently unavailable due to an error fetching insights.";
        }


        return {
            success: true,
            data: {
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                itemsReport,
                totalSalesAmount,
                avgSalesPerDay,
                avgAmountPerDay,
                totalUptimeMs,
                avgUptimePerDayMs,
                aiAnalysis: aiAnalysisText
            }
        };

    } catch (error: any) {
        console.error('Sales Report Generation Error:', error);
        return { success: false, error: 'Failed to generate sales report data.' };
    }
}
