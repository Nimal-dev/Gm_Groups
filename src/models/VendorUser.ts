import mongoose, { Schema, Document } from 'mongoose';

export interface IVendorUser extends Document {
    vendorId: string;
    mpin: string;
    role: 'MLB' | 'YKZ';
    name: string;
}

const VendorUserSchema: Schema = new Schema({
    vendorId: { type: String, required: true, unique: true },
    mpin: { type: String, required: true },
    role: { type: String, enum: ['MLB', 'YKZ'], required: true },
    name: { type: String, required: true }
}, { timestamps: true });

VendorUserSchema.index({ role: 1 });

if (mongoose.models?.VendorUser) {
    delete mongoose.models.VendorUser;
}

const VendorUser = mongoose.model<IVendorUser>('VendorUser', VendorUserSchema);

export default VendorUser;
