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
import { getLocalPeriodRange, formatLocalDate } from '@/lib/date-utils';

interface ReportData {
    startDate: string;
    endDate: string;
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    membersAdded: number;
    membersRemoved: number; // Placeholder
    totalSalaries: number;
    rawMaterialsExpense: number;
    ykzRawMaterials: number;
    mlbRawMaterials: number;
    miscellaneousExpense: number;
    miscellaneousDetails: { memo: string; amount: number; date?: string }[];
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
        rawMaterialsExpense: number;
        ykzRawMaterials: number;
        mlbRawMaterials: number;
        miscellaneousExpense: number;
        miscellaneousDetails: { memo: string; amount: number; date?: string }[];
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

export async function generateReportData(startDate: string | Date, endDate: string | Date): Promise<{ success: boolean; data?: ReportData; error?: string }> {
    try {
        await connectToDatabase();

        // Ensure dates are handled as LOCAL boundaries to match the dashboard
        const { start, end } = getLocalPeriodRange(startDate, endDate);

        // Fetch Bank Transactions
        const bankParams = {
            date: { $gte: start, $lte: end }
        };

        const transactions = await BankTransaction.find(bankParams).lean();

        // Fetch Salary Logs
        const salaryLogs = await SalaryLog.find({
            date: { $gte: start, $lte: end }
        }).lean();
        const totalSalaries = salaryLogs.reduce((sum: number, log: any) => sum + log.amount, 0);

        let totalIncome = 0;
        let totalExpense = 0;
        let rawMaterialsExpense = 0;
        let ykzRawMaterials = 0;
        let mlbRawMaterials = 0;
        let miscellaneousExpense = 0;
        let miscellaneousDetails: { memo: string; amount: number; date?: string }[] = [];

        transactions.forEach((t: any) => {
            // ONLY process financial transactions
            if (t.transactionType !== 'DEPOSIT' && t.transactionType !== 'WITHDRAW' && t.transactionType !== 'TRANSFER') {
                return;
            }

            const memoLower = (t.memo || '').toLowerCase();
            const toLower = (t.transferredTo || '').toLowerCase();
            
            // Define expense (Out)
            const isTransferOut = t.transactionType === 'TRANSFER' && (
                memoLower.includes('transfer to') ||
                (t.transferredTo && t.transferredTo.length > 0)
            );

            if (t.transactionType === 'WITHDRAW' || isTransferOut) {
                // Skip salary transfers because we calculate totalSalaries directly from SalaryLogs
                if (memoLower.includes('salary')) {
                    return; // Skip this iteration
                }

                totalExpense += t.amount;
                
                const isYKZ = memoLower.includes('ykz') || toLower.includes('ykz') || toLower.includes('6838311307');
                const isMLB = memoLower.includes('mlb') || toLower.includes('mlb') || toLower.includes('9144066578');

                if (isYKZ || isMLB) {
                    rawMaterialsExpense += t.amount;
                    if (isYKZ) ykzRawMaterials += t.amount;
                    if (isMLB) mlbRawMaterials += t.amount;
                } else {
                    miscellaneousExpense += t.amount;
                    miscellaneousDetails.push({
                        memo: t.memo || t.transferredTo || t.transactionType,
                        amount: t.amount,
                        date: t.date ? new Date(t.date).toISOString() : undefined
                    });
                }
            } else {
                // Income: DEPOSIT or incoming TRANSFER
                totalIncome += t.amount;
            }
        });

        const netProfit = totalIncome - totalExpense - totalSalaries;

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
                membersRemoved: 0, // System does not track removal date yet
                totalSalaries,
                rawMaterialsExpense,
                ykzRawMaterials,
                mlbRawMaterials,
                miscellaneousExpense,
                miscellaneousDetails
            }
        };
    } catch (error: any) {
        console.error('Report Generation Error:', error);
        return { success: false, error: 'Failed to generate report data.' };
    }
}

export async function generateFullShopReportData(startDate: string | Date, endDate: string | Date): Promise<{ success: boolean; data?: FullReportData; error?: string }> {
    try {
        await connectToDatabase();

        const { start, end } = getLocalPeriodRange(startDate, endDate);

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
        let rawMaterialsExpense = 0;
        let ykzRawMaterials = 0;
        let mlbRawMaterials = 0;
        let miscellaneousExpense = 0;
        let miscellaneousDetails: { memo: string; amount: number; date?: string }[] = [];

        transactions.forEach((t: any) => {
            // ONLY process financial transactions
            if (t.transactionType !== 'DEPOSIT' && t.transactionType !== 'WITHDRAW' && t.transactionType !== 'TRANSFER') {
                return;
            }

            const memoLower = (t.memo || '').toLowerCase();
            const toLower = (t.transferredTo || '').toLowerCase();

            const isTransferOut = t.transactionType === 'TRANSFER' && (
                memoLower.includes('transfer to') ||
                (t.transferredTo && t.transferredTo.length > 0)
            );

            if (t.transactionType === 'WITHDRAW' || isTransferOut) {
                // Skip salary transfers to avoid double-counting with totalSalaries
                if (memoLower.includes('salary')) {
                    return; // Skip this iteration
                }
                
                totalExpense += t.amount;

                const isYKZ = memoLower.includes('ykz') || toLower.includes('ykz') || toLower.includes('6838311307');
                const isMLB = memoLower.includes('mlb') || toLower.includes('mlb') || toLower.includes('9144066578');

                if (isYKZ || isMLB) {
                    rawMaterialsExpense += t.amount;
                    if (isYKZ) ykzRawMaterials += t.amount;
                    if (isMLB) mlbRawMaterials += t.amount;
                } else {
                    miscellaneousExpense += t.amount;
                    miscellaneousDetails.push({
                        memo: t.memo || t.transferredTo || t.transactionType,
                        amount: t.amount,
                        date: t.date ? new Date(t.date).toISOString() : undefined
                    });
                }
            } else {
                // Income: DEPOSIT or incoming TRANSFER
                totalIncome += t.amount;
            }
        });

        // 3. Salary Logs
        const salaryLogs = await SalaryLog.find({
            date: { $gte: start, $lte: end }
        }).lean();
        const totalSalaries = salaryLogs.reduce((sum, log) => sum + log.amount, 0);

        /* 
        let inventoryItems = [];
        try {
            const invRes = await fetchBot('/api/inventory', { method: 'GET' });
            if (invRes.ok) {
                const invData = await invRes.json();
                inventoryItems = invData.items || [];
            }
        } catch (e) {
            console.error("Report Generator: Inventory Fetch Error", e);
        }
        */

        // 5. HR Metrics
        const membersAdded = await Employee.countDocuments({ joinedAt: { $gte: start, $lte: end } });
        const totalEmployees = await Employee.countDocuments();

        // 6. Duty Logs
        const dutyLogs = await DutyLog.find({
            startTime: { $gte: start.getTime(), $lte: end.getTime() },
            isValid: true
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
                    netProfit: totalIncome - totalExpense - totalSalaries,
                    rawMaterialsExpense,
                    ykzRawMaterials,
                    mlbRawMaterials,
                    miscellaneousExpense,
                    miscellaneousDetails
                },
                inventory: [], // Commented out: inventoryItems,
                hr: {
                    membersAdded,
                    membersRemoved: 0,
                    totalEmployees
                },
                allTransactions: JSON.parse(JSON.stringify(transactions)),
                allSalaries: JSON.parse(JSON.stringify(salaryLogs)),
                dutyLogs: JSON.parse(JSON.stringify(dutyLogs))
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

export async function generateSalesReportData(startDate: string | Date, endDate: string | Date): Promise<{ success: boolean; data?: SalesReportData; error?: string }> {
    try {
        await connectToDatabase();

        const { start, end } = getLocalPeriodRange(startDate, endDate);

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
