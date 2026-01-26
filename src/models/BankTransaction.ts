import { Schema, model, Document, models } from 'mongoose';

export interface IBankTransaction extends Document {
    transactionId: string;
    accountName: string;
    accountNumber: string;
    transactionType: 'TRANSFER' | 'DEPOSIT' | 'WITHDRAW' | 'BALANCE_UPDATE' | 'Unknown';
    amount: number;
    memo?: string;
    date: Date;
    transferredTo?: string; // For transfers
    transferredFrom?: string; // Added
    newBalance?: number; // Added
    createdAt: Date;
}

// Matches the Bot's Schema
const BankTransactionSchema = new Schema<IBankTransaction>({
    transactionId: { type: String, required: true, unique: true },
    accountName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    transactionType: { type: String, required: true },
    amount: { type: Number, required: true },
    memo: { type: String },
    date: { type: Date, required: true },
    transferredTo: { type: String },
    transferredFrom: { type: String },
    newBalance: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

// Compound indexes for common queries
BankTransactionSchema.index({ date: -1, transactionType: 1 });
BankTransactionSchema.index({ accountName: 'text', accountNumber: 'text', memo: 'text' }); // Added memo for broader search // Text search support

// Use 'models' to prevent recompilation error in Next.js dev
export default models.BankTransaction || model<IBankTransaction>('BankTransaction', BankTransactionSchema);
