'use server';

import connectToDatabase from '@/lib/db';
import DutySession from '@/models/DutySession';
import BulkOrder from '@/models/BulkOrder';
import Employee from '@/models/Employee';
import SalaryLog from '@/models/SalaryLog';
import BankTransaction from '@/models/BankTransaction';
import RecurringOrder from '@/models/RecurringOrder';
import { unstable_cache } from 'next/cache';

// Internal data fetching function
const fetchDashboardData = unstable_cache(
    async () => {
        try {
            await connectToDatabase();

            // Fetch data provided with lean() for performance
            // Use .select() to fetch ONLY what is needed for the dashboard cards/tables
            const [activeStaff, activeOrders, allEmployees, recentSalaries, activeLeaves, recurringOrders] = await Promise.all([
                DutySession.find({ endTime: null })
                    .select('userId username startTime')
                    .sort({ startTime: -1 })
                    .lean(),

                BulkOrder.find({})
                    .select('orderId customer amount status details createdAt representative collectionDate surcharge eventDate deliveryDate messageId channelId isManual')
                    .sort({ createdAt: -1 })
                    .lean(),

                Employee.find({ status: 'Active' })
                    .select('userId username rank status joinedAt')
                    .sort({ rank: 1, username: 1 })
                    .lean(),

                SalaryLog.find({})
                    .sort({ date: -1 })
                    .limit(10)
                    .lean(),

                import('@/models/Leave').then(m => m.default.find({
                    endDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
                }).sort({ endDate: 1 }).lean()),

                RecurringOrder.find({})
                    .sort({ createdAt: -1 })
                    .lean()
            ]);

            // Process Active Staff (InMemory Map is fast for small n)
            const activeStaffWithDetails = activeStaff.map((session: any) => {
                const employeeRecord = allEmployees.find((e: any) => e.userId === session.userId);
                return {
                    _id: session._id.toString(),
                    userId: session.userId,
                    username: session.username,
                    startTime: session.startTime ? new Date(session.startTime).toISOString() : null,
                    displayName: employeeRecord ? employeeRecord.username : session.username,
                    rank: employeeRecord ? employeeRecord.rank : 'Staff'
                };
            });

            // Manual mapping to avoid expensive JSON.parse(JSON.stringify())
            const serializedOrders = activeOrders.map((order: any) => ({
                ...order,
                _id: order._id.toString(),
                createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
                // Ensure items are serializable if they have nested ObjectIds (usually not for this simple schema)
            }));

            const serializedRecurring = recurringOrders.map((order: any) => ({
                ...order,
                _id: order._id.toString(),
                createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString()
            }));

            const serializedEmployees = allEmployees.map((e: any) => ({
                ...e,
                _id: e._id.toString(),
                joinedAt: e.joinedAt ? new Date(e.joinedAt).toISOString() : null
            }));

            const serializedSalaries = recentSalaries.map((s: any) => ({
                ...s,
                _id: s._id.toString(),
                date: s.date ? new Date(s.date).toISOString() : new Date().toISOString()
            }));

            const serializedLeaves = activeLeaves.map((l: any) => ({
                ...l,
                _id: l._id.toString(),
                startDate: l.startDate ? new Date(l.startDate).toISOString() : null,
                endDate: l.endDate ? new Date(l.endDate).toISOString() : null,
                createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : null
            }));

            // Fetch Bank Stats (Current Month) - Aggregation is efficient
            const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

            const bankData = await BankTransaction.aggregate([
                { $match: { date: { $gte: startOfMonth } } },
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

            // Fetch Current Balance (Latest Transaction)
            const latestTransaction = await BankTransaction.findOne().sort({ date: -1, _id: -1 }).select('newBalance').lean();
            const currentBalance = latestTransaction?.newBalance || 0;

            const stats = bankData[0] || { totalIncome: 0, totalExpense: 0 };
            const totalIncome = stats.totalIncome;
            const totalExpense = stats.totalExpense;

            return {
                activeStaff: activeStaffWithDetails,
                activeOrders: serializedOrders,
                recurringOrders: serializedRecurring,
                allEmployees: serializedEmployees,
                recentSalaries: serializedSalaries,
                activeLeaves: serializedLeaves,
                bankStats: { totalIncome, totalExpense, currentBalance }, // Added currentBalance
                timestamp: new Date().toISOString(),
                error: null
            };
        } catch (error: any) {
            console.error('Data Fetch Error (Inside Cache):', error);
            throw new Error(error.message);
        }
    },
    ['dashboard-data-cache'],
    { revalidate: 60, tags: ['dashboard-data'] }
);

export async function getDashboardData() {
    try {
        return await fetchDashboardData();
    } catch (error: any) {
        console.error('Dashboard Data Fetch Error:', error);
        return {
            activeStaff: [],
            activeOrders: [],
            recurringOrders: [],
            allEmployees: [],
            recentSalaries: [],
            activeLeaves: [],
            bankStats: { totalIncome: 0, totalExpense: 0, currentBalance: 0 },
            timestamp: new Date().toISOString(),
            error: error.message
        };
    }
}

export async function getLiveActiveStaff() {
    try {
        await connectToDatabase();

        // Fetch only active sessions
        const activeStaff = await DutySession.find({ endTime: null })
            .select('userId username startTime')
            .sort({ startTime: -1 })
            .lean();

        // Get details for these staff members
        const userIds = activeStaff.map((s: any) => s.userId);
        const employees = await Employee.find({ userId: { $in: userIds } })
            .select('userId username rank')
            .lean();

        // Combine data
        const activeStaffWithDetails = activeStaff.map((session: any) => {
            // Robust comparison: convert to string and trim
            const sessionUserId = String(session.userId).trim();
            const employeeRecord = employees.find((e: any) => String(e.userId).trim() === sessionUserId);

            return {
                _id: session._id.toString(),
                userId: session.userId,
                username: session.username,
                startTime: session.startTime ? new Date(session.startTime).toISOString() : null,
                displayName: employeeRecord ? employeeRecord.username : session.username,
                rank: employeeRecord ? employeeRecord.rank : 'Staff' // Default if no match found
            };
        });

        return { success: true, activeStaff: activeStaffWithDetails };
    } catch (error: any) {
        console.error('Live Staff Fetch Error:', error);
        return { success: false, error: error.message };
    }
}
