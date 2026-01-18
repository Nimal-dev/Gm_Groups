import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
    userId: string;
    username: string;
    nickname?: string;
    rank: string;
    joinedAt: Date;
    status: 'Active' | 'Inactive';
}

const EmployeeSchema: Schema = new Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    nickname: { type: String },
    rank: { type: String, default: 'Employee' },
    joinedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
});

// Index for optimization
EmployeeSchema.index({ status: 1 });

const Employee = mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);

export default Employee;
