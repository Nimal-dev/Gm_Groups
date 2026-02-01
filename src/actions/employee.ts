
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

// --- CRUD Actions for Employee Management ---

export async function addEmployee(data: any) {
    try {
        const session = await auth();
        // Allow Admin/Bulkhead/Manager
        if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'bulkhead')) {
            return { success: false, error: 'Unauthorized' };
        }

        await connectToDatabase();

        // Check for existing ID
        const existing = await Employee.findOne({ userId: data.userId });
        if (existing) {
            return { success: false, error: 'User ID already exists' };
        }

        const newEmployee = new Employee({
            ...data,
            joinedAt: new Date(),
            xp: 0,
            level: 1,
            achievements: []
        });

        await newEmployee.save();
        return { success: true };
    } catch (error: any) {
        console.error('Add Employee Error:', error);
        return { success: false, error: error.message || 'Failed to add employee' };
    }
}

export async function updateEmployee(userId: string, data: any) {
    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'bulkhead')) {
            return { success: false, error: 'Unauthorized' };
        }

        await connectToDatabase();

        const updated = await Employee.findOneAndUpdate(
            { userId: userId },
            {
                $set: {
                    username: data.username,
                    nickname: data.nickname,
                    rank: data.rank,
                    status: data.status,
                    bankAccountNo: data.bankAccountNo
                }
            },
            { new: true }
        );

        if (!updated) return { success: false, error: 'Employee not found' };

        return { success: true };
    } catch (error: any) {
        console.error('Update Employee Error:', error);
        return { success: false, error: 'Failed to update employee' };
    }
}

export async function deleteEmployee(userId: string) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return { success: false, error: 'Unauthorized' };
        }

        await connectToDatabase();
        await Employee.deleteOne({ userId });

        return { success: true };
    } catch (error: any) {
        console.error('Delete Employee Error:', error);
        return { success: false, error: 'Failed to delete employee' };
    }
}
