import mongoose, { Schema, Document } from 'mongoose';

export interface IDutyLog extends Document {
    userId: string;
    username: string;
    startTime: number;
    endTime: number;
    durationMs: number;
    isValid: boolean;
}

const DutyLogSchema: Schema = new Schema({
    userId: { type: String, required: true },
    username: { type: String, required: true },
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
    durationMs: { type: Number, required: true },
    isValid: { type: Boolean, default: true }
});

// Indexes for optimization
DutyLogSchema.index({ userId: 1, startTime: 1 });

const DutyLog = mongoose.models.DutyLog || mongoose.model<IDutyLog>('DutyLog', DutyLogSchema);

export default DutyLog;
