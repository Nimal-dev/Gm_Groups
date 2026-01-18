import { config } from 'dotenv';
import mongoose, { Schema } from 'mongoose';

config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('MONGO_URI is not defined in .env');
    process.exit(1);
}

const UserSchema = new Schema(
    {
        username: {
            type: String,
            required: [true, 'Please provide a username'],
            unique: true,
        },
        password: {
            type: String,
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

// Prevent overwriting model if it somehow exists (unlikely in standalone)
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI!, { dbName: 'gmbot' });
        console.log('Connected');

        const username = 'DemoAdmin';
        const password = 'password123';
        const role = 'admin';

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log(`User ${username} exists. Updating...`);
            existingUser.password = password;
            existingUser.role = role;
            await existingUser.save();
            console.log(`Updated.`);
        } else {
            console.log(`Creating user ${username}...`);
            await User.create({ username, password, role });
            console.log(`Created.`);
        }

        console.log('Done.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

seed();
