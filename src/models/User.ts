import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    password?: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    xp: number;
    level: number;
    achievements: {
        id: string;
        title: string;
        unlockedAt: Date;
        icon?: string;
    }[];
}

const UserSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: [true, 'Please provide a username'],
            unique: true,
        },
        password: {
            type: String,
            // Password is optional for now to allow for future OAuth or other auth methods, 
            // but required for credentials login.
            select: true,
        },
        role: {
            type: String,
            default: 'staff',
            enum: ['admin', 'staff', 'user'],
        },
        xp: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        achievements: [{
            id: String,
            title: String,
            unlockedAt: Date,
            icon: String
        }]
    },
    {
        timestamps: true,
    }
);

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
