
'use server';

import connectToDatabase from '@/lib/db';
import Employee from '@/models/Employee';
import { auth } from '@/auth';
import { revalidatePath, revalidateTag } from 'next/cache';

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

        const isAdmin = session.user.role === 'admin' || session.user.role === 'bulkhead';
        
        // Serialize for client
        const serialized = employees.map(emp => ({
            id: emp._id.toString(),
            userId: emp.userId,
            username: emp.username,
            nickname: emp.nickname,
            loginId: emp.loginId, // Exposed for admins 
            mpin: isAdmin ? emp.mpin : undefined, 
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
        revalidatePath('/dashboard');
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
                    loginId: data.loginId,
                    mpin: data.mpin,
                    rank: data.rank,
                    status: data.status,
                    bankAccountNo: data.bankAccountNo
                }
            },
            { new: true }
        );

        if (!updated) return { success: false, error: 'Employee not found' };

        revalidatePath('/dashboard');
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

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Delete Employee Error:', error);
        return { success: false, error: 'Failed to delete employee' };
    }
}

export async function resetLeaderboard() {
    try {
        const session = await auth();
        if (!session?.user) {
            return { success: false, error: 'Unauthorized: Please log in.' };
        }

        await connectToDatabase();

        // Check if user is Manager or above
        const caller = await Employee.findOne({
            $or: [
                { userId: session.user.id },
                { username: { $regex: new RegExp(`^${session.user.name}$`, 'i') } }
            ]
        });

        const rank = (caller?.rank || '').toLowerCase();
        const role = (session.user.role || '').toLowerCase();

        const isManagerOrAbove = role === 'admin' ||
            rank.includes('manager') ||
            rank.includes('management') ||
            rank.includes('owner') ||
            rank.includes('boss') ||
            rank.includes('lawyer');

        if (!isManagerOrAbove) {
            return { success: false, error: 'Forbidden: Only Manager or above can reset the leaderboard.' };
        }

        const result = await Employee.updateMany(
            {},
            {
                $set: {
                    xp: 0,
                    level: 1
                }
            }
        );

        // Log the activity to Discord analytics
        const { logActivity } = await import('@/actions/log');
        await logActivity(
            'Reset Leaderboard',
            `Leaderboard reset by ${session.user.name || caller?.username || 'Admin'} (${caller?.rank || 'Manager+'}). Reset ${result.modifiedCount} employees to Level 1 and 0 XP.`
        ).catch(err => console.error('Failed to log reset leaderboard activity:', err));

        revalidatePath('/dashboard');
        revalidatePath('/portal/dashboard');
        revalidateTag('dashboard-data');

        return { success: true, count: result.modifiedCount };
    } catch (error: any) {
        console.error('Reset Leaderboard Error:', error);
        return { success: false, error: error.message || 'Failed to reset leaderboard' };
    }
}

