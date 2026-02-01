import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
    userId: string;
    username: string;
    nickname?: string;
    rank: string;
    joinedAt: Date;
    status: 'Active' | 'Inactive';
    bankAccountNo?: string;
    xp: number;
    level: number;
    achievements: {
        id: string;
        title: string;
        unlockedAt: Date;
        icon?: string;
    }[];
}

const EmployeeSchema: Schema = new Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    nickname: { type: String },
    rank: { type: String, default: 'Employee' },
    joinedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    bankAccountNo: { type: String },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    achievements: [{
        id: String,
        title: String,
        unlockedAt: Date,
        icon: String
    }]
});

// Index for optimization
EmployeeSchema.index({ status: 1 });
EmployeeSchema.index({ level: -1, xp: -1 }); // Sorting Leaderboard

// Force delete model if it exists to prevent caching issues during dev
if (mongoose.models && mongoose.models.Employee) {
    delete mongoose.models.Employee;
}

const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);

export default Employee;
