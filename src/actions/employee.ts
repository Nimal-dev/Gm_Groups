
'use server';

import connectToDatabase from '@/lib/db';
import Employee from '@/models/Employee';
import { auth } from '@/auth';

export async function getAllEmployees() {
    try {
        const session = await auth();
        // Basic role check - allow staff/admin/bulkhead
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' };
        }

        await connectToDatabase();

        // Fetch all employees, sorted by Level (desc) then XP (desc)
        const employees = await Employee.find({})
            .sort({ level: -1, xp: -1 })
            .lean();

        // Serialize for client
        const serialized = employees.map(emp => ({
            id: emp._id.toString(),
            userId: emp.userId,
            username: emp.username,
            rank: emp.rank,
            status: emp.status,
            xp: emp.xp || 0,
            level: emp.level || 1,
            achievementsCount: emp.achievements?.length || 0,
            joinedAt: emp.joinedAt ? emp.joinedAt.toISOString() : null
        }));

        return { success: true, employees: serialized };

    } catch (error: any) {
        console.error('Fetch Employees Error:', error);
        return { success: false, error: 'Failed to fetch employees' };
    }
}
