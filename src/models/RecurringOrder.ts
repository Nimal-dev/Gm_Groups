import mongoose, { Schema, Document } from 'mongoose';

export interface IRecurringOrder extends Document {
    customer: string;
    amount: string;
    startDate: string;
    intervalDays: number;
    items: string;
    deliveryDetails: string;
    creatorName: string;
    status: string; // 'Active', 'Ended'
    createdAt: Date;
    discordMessageId?: string;
    channelId?: string;
    endedAt?: Date;
}

const RecurringOrderSchema: Schema = new Schema({
    customer: { type: String, required: true },
    amount: { type: String, required: true },
    startDate: { type: String, required: true },
    intervalDays: { type: Number, required: true },
    items: { type: String, required: true },
    deliveryDetails: { type: String, required: false },
    creatorName: { type: String, required: true },
    status: { type: String, default: 'Active' },
    createdAt: { type: Date, default: Date.now },
    discordMessageId: { type: String, required: false },
    channelId: { type: String, required: false },
    endedAt: { type: Date, required: false }
});

// Prevent overwrite
const RecurringOrder = mongoose.models.RecurringOrder || mongoose.model<IRecurringOrder>('RecurringOrder', RecurringOrderSchema);
export default RecurringOrder;
