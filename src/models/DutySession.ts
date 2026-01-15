import mongoose, { Schema, Document } from 'mongoose';

export interface IDutySession extends Document {
    userId: string;
    username: string;
    startTime: number;
}

const DutySessionSchema: Schema = new Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    startTime: { type: Number, required: true, index: true } // Indexed for sorting
});

// Compound Index if we often search by user AND time
DutySessionSchema.index({ userId: 1, startTime: -1 });

const DutySession = mongoose.models.DutySession || mongoose.model<IDutySession>('DutySession', DutySessionSchema);

export default DutySession;
