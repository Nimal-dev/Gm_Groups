import { config } from 'dotenv';
config(); // Load environment variables

import connectToDatabase from '../src/lib/db';
import User from '../src/models/User';

async function seedUser() {
    try {
        console.log('Connecting to database...');
        await connectToDatabase();
        console.log('Connected.');

        const username = 'DemoAdmin';
        const password = 'password123';
        const role = 'admin';

        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log(`User '${username}' already exists.`);
            // Update password just in case
            existingUser.password = password;
            existingUser.role = role;
            await existingUser.save();
            console.log(`Updated existing user '${username}'.`);
        } else {
            const newUser = new User({
                username,
                password,
                role,
            });
            await newUser.save();
            console.log(`Created new user '${username}'.`);
        }

        console.log('Done.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding user:', error);
        process.exit(1);
    }
}

seedUser();
