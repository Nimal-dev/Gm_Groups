import mongoose, { Schema, Document } from 'mongoose';

export interface IBankBalanceLog extends Document {
    messageId: string;
    accountNumber: string;
    oldBalance: number;
    newBalance: number;
    date: Date;
    createdAt: Date;
}

const BankBalanceLogSchema: Schema = new Schema({
    messageId: { type: String, required: true, unique: true },
    accountNumber: { type: String, required: true, index: true },
    oldBalance: { type: Number, required: true },
    newBalance: { type: Number, required: true },
    date: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.BankBalanceLog || mongoose.model<IBankBalanceLog>('BankBalanceLog', BankBalanceLogSchema);
