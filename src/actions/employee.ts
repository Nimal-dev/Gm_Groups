'use server';

import connectToDatabase from '@/lib/db';
import Employee, { IEmployee } from '@/models/Employee';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema Validation
const EmployeeSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    username: z.string().min(1, "Username is required"),
    rank: z.string().min(1, "Rank is required"),
    status: z.enum(['Active', 'Inactive']).default('Active'),
    joinedAt: z.date().optional()
});

export async function addEmployee(formData: z.infer<typeof EmployeeSchema>) {
    try {
        const validated = EmployeeSchema.parse(formData);
        await connectToDatabase();

        const existing = await Employee.findOne({ userId: validated.userId });
        if (existing) {
            return { success: false, error: 'Employee with this User ID already exists.' };
        }

        await Employee.create({
            ...validated,
            joinedAt: new Date()
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Add Employee Error:', error);
        return { success: false, error: error.errors?.[0]?.message || error.message || 'Failed to add employee' };
    }
}

export async function updateEmployee(userId: string, data: Partial<z.infer<typeof EmployeeSchema>>) {
    try {
        await connectToDatabase();

        const result = await Employee.findOneAndUpdate(
            { userId },
            { $set: data },
            { new: true }
        );

        if (!result) {
            return { success: false, error: 'Employee not found' };
        }

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Update Employee Error:', error);
        return { success: false, error: error.message || 'Failed to update employee' };
    }
}

export async function deleteEmployee(userId: string) {
    try {
        await connectToDatabase();
        const result = await Employee.findOneAndDelete({ userId });

        if (!result) {
            return { success: false, error: 'Employee not found' };
        }

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Delete Employee Error:', error);
        return { success: false, error: error.message || 'Failed to delete employee' };
    }
}
