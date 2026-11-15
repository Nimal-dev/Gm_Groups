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
    // 1. Return existing connection immediately if healthy and ready (readyState === 1: Connected)
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    // 2. If a connection is already in-flight (readyState === 2: Connecting), wait for it instead of wiping or reconnecting
    if (cached.promise && mongoose.connection.readyState === 2) {
        cached.conn = await cached.promise;
        return cached.conn;
    }

    // 3. Only if connection dropped or disconnected (readyState === 0 or 3), reset cache
    if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
        cached.conn = null;
        cached.promise = null;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            dbName: 'gmbot', // Explicitly connecting to the bot's DB
            maxPoolSize: 10,
            minPoolSize: 2, // Maintain warm sockets in pool for instant response
            maxIdleTimeMS: 60000,
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
