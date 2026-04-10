import mongoose, { Schema, Document } from 'mongoose';

export interface ISalesLogItem {
    name: string;
    quantity: number;
    price: number;
}

export interface ISalesLog extends Document {
    userId: string;
    staffName: string;
    items: ISalesLogItem[];
    discount: number;
    total: number;
    createdAt: Date;
}

const SalesLogItemSchema = new Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
});

const SalesLogSchema: Schema = new Schema({
    userId: { type: String, required: true },
    staffName: { type: String, required: true },
    items: [SalesLogItemSchema],
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Force delete model if it exists to prevent caching issues during dev
if (mongoose.models && mongoose.models.SalesLog) {
    delete mongoose.models.SalesLog;
}

const SalesLog = mongoose.models.SalesLog || mongoose.model<ISalesLog>('SalesLog', SalesLogSchema);

export default SalesLog;
