import mongoose, { Schema, Document } from 'mongoose';

export interface IVendorInventory extends Document {
    itemName: string;
    price: number;
    unit: string;
    vendorRole: 'MLB' | 'YKZ';
    createdAt: Date;
    updatedAt: Date;
}

const VendorInventorySchema: Schema = new Schema({
    itemName: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true, default: 'per unit' },
    vendorRole: { type: String, enum: ['MLB', 'YKZ'], required: true }
}, { timestamps: true });

VendorInventorySchema.index({ vendorRole: 1 });
VendorInventorySchema.index({ vendorRole: 1, itemName: 1 });

const VendorInventory = mongoose.models.VendorInventory || mongoose.model<IVendorInventory>('VendorInventory', VendorInventorySchema);

export default VendorInventory;
