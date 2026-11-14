import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItemIngredient {
    materialId: string;
    materialName: string;
    quantity: number;
}

export interface IMenuItem extends Document {
    id: string; // unique slug e.g. 'double_cheese_beef_burger'
    name: string; // e.g. 'Double Cheese Beef Burger'
    category: string; // e.g. 'Burgers', 'Italian', 'Japanese', 'Beverages', 'Mains', etc.
    type: 'Food' | 'Beverage' | 'Component';
    price: number; // Selling price in $
    batchSize: number; // Default batch size, e.g. 5
    prepTime: string; // e.g. '41s' or '5 mins'
    description: string;
    imageUrl: string;
    station: string; // 'Kitchen', 'Bar / Drinks', 'Grill', etc.
    hunger?: number;
    thirst?: number;
    isPopular: boolean;
    isAvailable: boolean;
    setGroup: 'set_a' | 'set_b' | 'signatures';
    ingredients: IMenuItemIngredient[];
    createdAt: Date;
    updatedAt: Date;
}

const MenuItemIngredientSchema = new Schema({
    materialId: { type: String, required: true },
    materialName: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 }
}, { _id: false });

const MenuItemSchema = new Schema<IMenuItem>({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true, default: 'Mains' },
    type: { type: String, enum: ['Food', 'Beverage', 'Component'], default: 'Food' },
    price: { type: Number, required: true, default: 0 },
    batchSize: { type: Number, required: true, default: 5 },
    prepTime: { type: String, default: '30s' },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    station: { type: String, default: 'Kitchen' },
    hunger: { type: Number, default: 0 },
    thirst: { type: Number, default: 0 },
    isPopular: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    setGroup: { type: String, enum: ['set_a', 'set_b', 'signatures'], default: 'set_a' },
    ingredients: [MenuItemIngredientSchema]
}, {
    timestamps: true
});

MenuItemSchema.index({ category: 1 });
MenuItemSchema.index({ setGroup: 1, isAvailable: 1 });

const MenuItem = mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);

export default MenuItem;
