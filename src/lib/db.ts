import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGO_URI environment variable inside .env'
    );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// @ts-ignore
let cached = global.mongoose;

if (!cached) {
    // @ts-ignore
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    // Return existing connection immediately if healthy and ready (readyState === 1: Connected)
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    // If connection dropped or socket closed, clear cache to force a fresh connection
    if (mongoose.connection.readyState !== 1) {
        cached.conn = null;
        cached.promise = null;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            dbName: 'gmbot', // Explicitly connecting to the bot's DB
            maxPoolSize: 10, // Optimization for Free Tier
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((m) => {
            return m;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        cached.conn = null;
        throw e;
    }

    return cached.conn;
}

export default connectToDatabase;
