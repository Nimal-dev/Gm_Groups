import mongoose, { Schema, Document } from 'mongoose';

export interface ISalaryLog extends Document {
    userId: string;
    username?: string;
    amount: number;
    date: Date;
    processedBy: string;
    processorName?: string;
    notes?: string;
}

const SalaryLogSchema: Schema = new Schema({
    userId: { type: String, required: true },
    username: { type: String }, // Snapshot of recipient name
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    processedBy: { type: String, required: true },
    processorName: { type: String }, // Snapshot of processor name
    notes: { type: String }
});

// Index for optimization
SalaryLogSchema.index({ userId: 1 });

const SalaryLog = mongoose.models.SalaryLog || mongoose.model<ISalaryLog>('SalaryLog', SalaryLogSchema);

export default SalaryLog;
