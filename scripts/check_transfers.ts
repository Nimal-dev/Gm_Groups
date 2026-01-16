import connectToDatabase from '@/lib/db';
import BankTransaction from '@/models/BankTransaction';
import mongoose from 'mongoose';

async function checkTransfers() {
    try {
        await connectToDatabase();
        console.log("Connected to DB.");

        const totalTransfers = await BankTransaction.countDocuments({ transactionType: 'TRANSFER' });

        const transfersWithTo = await BankTransaction.countDocuments({
            transactionType: 'TRANSFER',
            transferredTo: { $ne: null }
        });

        const transfersWithMemoTo = await BankTransaction.countDocuments({
            transactionType: 'TRANSFER',
            memo: { $regex: /transfer to/i }
        });

        const sampleTransfers = await BankTransaction.find({
            transactionType: 'TRANSFER'
        }).limit(10).select('memo transferredTo amount transactionType');

        console.log(`\n--- Verification Results ---`);
        console.log(`Total TRANSFER logs: ${totalTransfers}`);
        console.log(`Transfers with 'transferredTo' field: ${transfersWithTo}`);
        console.log(`Transfers with 'transfer to' in memo: ${transfersWithMemoTo}`);

        console.log(`\n--- Sample Transfers ---`);
        sampleTransfers.forEach(t => {
            console.log(`Type: ${t.transactionType} | Amount: ${t.amount} | ToField: '${t.transferredTo}' | Memo: '${t.memo}'`);
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

checkTransfers();
