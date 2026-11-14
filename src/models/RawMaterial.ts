import mongoose, { Schema, Document } from 'mongoose';

export interface IRawMaterial extends Document {
    id: string; // unique slug e.g. 'flour_tortilla'
    name: string; // e.g. 'Flour Tortilla'
    category: string; // e.g. 'Bakery & Buns', 'Meat & Poultry', etc.
    ykzRate: number; // default rate from YKZ partner
    mlbRate: number; // default rate from MLB partner
    weight: number; // weight in kg
    unit: string; // e.g. 'per unit', 'per kg'
    station?: string;
    createdAt: Date;
    updatedAt: Date;
}

const RawMaterialSchema = new Schema<IRawMaterial>({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true, default: 'General' },
    ykzRate: { type: Number, required: true, default: 0 },
    mlbRate: { type: Number, required: true, default: 0 },
    weight: { type: Number, default: 0.1 },
    unit: { type: String, default: 'per unit' },
    station: { type: String, default: 'Kitchen' }
}, {
    timestamps: true
});

RawMaterialSchema.index({ category: 1 });

const RawMaterial = mongoose.models.RawMaterial || mongoose.model<IRawMaterial>('RawMaterial', RawMaterialSchema);

export default RawMaterial;
