import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    password?: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
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
    },
    {
        timestamps: true,
    }
);

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
