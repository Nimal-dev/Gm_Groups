import { Schema, model, Document, models } from 'mongoose';

export interface IBankTransaction extends Document {
    transactionId: string;
    accountName: string;
    accountNumber: string;
    accountType: string;
    transactionType: 'TRANSFER' | 'DEPOSIT' | 'WITHDRAW' | 'Unknown';
    amount: number;
    memo?: string;
    date: Date;
    cardType?: string;
    transferredTo?: string; // For transfers
    rawMessageId: string; // To prevent duplicates
    createdAt: Date;
}

// Matches the Bot's Schema
const BankTransactionSchema = new Schema<IBankTransaction>({
    transactionId: { type: String, required: true, unique: true },
    accountName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountType: { type: String, required: true },
    transactionType: { type: String, required: true },
    amount: { type: Number, required: true },
    memo: { type: String },
    date: { type: Date, required: true },
    cardType: { type: String },
    transferredTo: { type: String },
    rawMessageId: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
});

// Compound indexes for common queries
BankTransactionSchema.index({ date: -1, transactionType: 1 });
BankTransactionSchema.index({ accountName: 'text', accountNumber: 'text', memo: 'text' }); // Added memo for broader search // Text search support

// Use 'models' to prevent recompilation error in Next.js dev
export default models.BankTransaction || model<IBankTransaction>('BankTransaction', BankTransactionSchema);
