'use server';

import connectToDatabase from '@/lib/db';
import DutySession from '@/models/DutySession';
import BulkOrder from '@/models/BulkOrder';
import Employee from '@/models/Employee';
import SalaryLog from '@/models/SalaryLog';
import BankTransaction from '@/models/BankTransaction';

import { unstable_cache } from 'next/cache';

// Internal data fetching function
const fetchDashboardData = unstable_cache(
    async () => {
        try {
            await connectToDatabase();

            // Fetch data provided with lean() for performance
            // Use .select() to fetch ONLY what is needed for the dashboard cards/tables
            const [activeStaff, activeOrders, allEmployees, recentSalaries] = await Promise.all([
                DutySession.find({ endTime: null })
                    .select('userId username startTime')
                    .sort({ startTime: -1 })
                    .lean(),

                BulkOrder.find({ status: { $ne: 'Completed' } })
                    .select('orderId customer amount status items createdAt')
                    .sort({ createdAt: -1 })
                    .lean(),

                // We need rank/username for mapping activeStaff, but maybe not everything else?
                // Keeping it mostly full for now as it's not huge, but excluding sensitive fields if any were added.
                Employee.find({ status: 'Active' })
                    .select('userId username rank status')
                    .sort({ rank: 1, username: 1 })
                    .lean(),

                SalaryLog.find({})
                    .sort({ date: -1 })
                    .limit(10)
                    .lean()
            ]);

            // Process Active Staff (InMemory Map is fast for small n)
            const activeStaffWithDetails = activeStaff.map((session: any) => {
                const employeeRecord = allEmployees.find((e: any) => e.userId === session.userId);
                return {
                    _id: session._id.toString(),
                    userId: session.userId,
                    username: session.username,
                    startTime: session.startTime?.toISOString() || null,
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

            const serializedEmployees = allEmployees.map((e: any) => ({
                ...e,
                _id: e._id.toString(),
                joinedAt: e.joinedAt?.toISOString() || null
            }));

            const serializedSalaries = recentSalaries.map((s: any) => ({
                ...s,
                _id: s._id.toString(),
                date: s.date?.toISOString()
            }));

            // Fetch Bank Stats (last 30 days) - Aggregation is efficient
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const bankStats = await BankTransaction.aggregate([
                { $match: { date: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: '$transactionType',
                        total: { $sum: '$amount' }
                    }
                }
            ]);

            const totalIncome = bankStats.find((s: any) => s._id === 'DEPOSIT')?.total || 0;
            const totalExpense = bankStats.reduce((acc: number, curr: any) =>
                (curr._id === 'WITHDRAW' || curr._id === 'TRANSFER') ? acc + curr.total : acc, 0
            );

            // Return optimized data
            return {
                activeStaff: activeStaffWithDetails,
                activeOrders: serializedOrders,
                allEmployees: serializedEmployees,
                recentSalaries: serializedSalaries,
                bankStats: { totalIncome, totalExpense },
                timestamp: new Date().toISOString(),
                error: null
            };
        } catch (error: any) {
            console.error('Data Fetch Error (Inside Cache):', error);
            throw new Error(error.message); // Throw to handle in wrapper
        }
    },
    ['dashboard-data-cache'], // Key parts
    { revalidate: 60, tags: ['dashboard-data'] } // Revalidate every 60 seconds
);

export async function getDashboardData() {
    try {
        return await fetchDashboardData();
    } catch (error: any) {
        console.error('Dashboard Data Fetch Error:', error);
        // Fallback or empty return on failure
        return {
            activeStaff: [],
            activeOrders: [],
            allEmployees: [],
            recentSalaries: [],
            bankStats: { totalIncome: 0, totalExpense: 0 },
            timestamp: new Date().toISOString(),
            error: error.message
        };
    }
}
