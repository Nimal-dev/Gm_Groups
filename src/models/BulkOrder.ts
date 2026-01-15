import mongoose, { Schema, Document } from 'mongoose';

export interface IBulkOrder extends Document {
    orderId: number;
    customer: string;
    amount: string; // Can be string like "$500" or just "500"
    deliveryDate: string;
    details: string;
    status: string; // 'Pending', 'In Progress', 'Ready', 'Completed'
    createdAt: number;
    messageId: string; // Discord Message ID of the ACTIVE order in staff channel
    channelId: string; // Discord Channel ID where the active order is
    isManual: boolean;
    representative?: string;
    collectionDate?: string;
    surcharge?: string;
    eventDate?: string;
}

const BulkOrderSchema: Schema = new Schema({
    orderId: { type: Number, required: true, unique: true },
    customer: { type: String, required: true },
    amount: { type: String, required: true },
    deliveryDate: { type: String, required: true },
    details: { type: String, required: true },
    status: { type: String, required: true },
    createdAt: { type: Number, default: Date.now },
    messageId: { type: String, required: false, index: true },
    channelId: { type: String, required: false },
    isManual: { type: Boolean, default: true },
    representative: { type: String, required: false },
    collectionDate: { type: String, required: false }, // Format: DD/MM/YYYY
    surcharge: { type: String, required: false },
    eventDate: { type: String, required: false } // Format: DD/MM/YYYY
});

// Indexes for filtering active orders
BulkOrderSchema.index({ status: 1 });
BulkOrderSchema.index({ createdAt: -1 });

const BulkOrder = mongoose.models.BulkOrder || mongoose.model<IBulkOrder>('BulkOrder', BulkOrderSchema);

export default BulkOrder;
