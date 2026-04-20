import mongoose, { Schema, Document } from 'mongoose';

export interface IDailySalary extends Document {
    userId: string;
    username: string;
    date: string; // YYYY-MM-DD format (Asia/Kolkata timezone)
    
    // Raw metrics accumulated for the day
    dutyDurationMs: number;
    salesQuantity: number;
    salesTotalValue: number;
    foodQuantity: number;
    foodTotalValue: number;

    // Computed salary portions
    baseSalaryEarned: number;
    salesCommissionEarned: number;
    foodCommissionEarned: number;

    // Total for the day
    totalEarned: number;
    
    lastUpdated: Date;
}

const DailySalarySchema: Schema = new Schema({
    userId: { type: String, required: true },
    username: { type: String, required: true },
    date: { type: String, required: true },
    
    dutyDurationMs: { type: Number, default: 0 },
    salesQuantity: { type: Number, default: 0 },
    salesTotalValue: { type: Number, default: 0 },
    foodQuantity: { type: Number, default: 0 },
    foodTotalValue: { type: Number, default: 0 },

    baseSalaryEarned: { type: Number, default: 0 },
    salesCommissionEarned: { type: Number, default: 0 },
    foodCommissionEarned: { type: Number, default: 0 },

    totalEarned: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

// Index for getting a specific user's daily record efficiently
DailySalarySchema.index({ userId: 1, date: 1 }, { unique: true });

// Force delete model if it exists to prevent caching issues during dev
if (mongoose.models && mongoose.models.DailySalary) {
    delete mongoose.models.DailySalary;
}

const DailySalary = mongoose.models.DailySalary || mongoose.model<IDailySalary>('DailySalary', DailySalarySchema);

export default DailySalary;
