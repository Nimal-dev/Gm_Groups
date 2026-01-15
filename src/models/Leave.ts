import { Schema, model, models, Document } from 'mongoose';

export interface ILeave extends Document {
    userId: string;
    username: string;
    startDate: Date;
    endDate: Date;
    reason?: string;
    createdAt: Date;
}

const LeaveSchema = new Schema<ILeave>({
    userId: { type: String, required: true },
    username: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Index for efficient date querying
LeaveSchema.index({ endDate: 1 });

export default models.Leave || model<ILeave>('Leave', LeaveSchema);
