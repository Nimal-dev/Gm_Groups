'use server';

import connectToDatabase from '@/lib/db';
import DutySession from '@/models/DutySession';
import DutyLog from '@/models/DutyLog';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function getDutyStatus() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        await connectToDatabase();

        const userId = String(session.user.id).trim();

        const dutySession = await DutySession.findOne({ userId: userId }).lean();

        if (dutySession) {
            return {
                success: true,
                isOnDuty: true,
                startTime: dutySession.startTime
            };
        }

        return {
            success: true,
            isOnDuty: false
        };

    } catch (error: any) {
        console.error("Get Duty Status Error:", error);
        return { success: false, error: "Failed to fetch duty status" };
    }
}

export async function clockIn() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        await connectToDatabase();

        const userId = String(session.user.id).trim(); // Ensure clean ID

        const existingSession = await DutySession.findOne({ userId: userId });
        if (existingSession) {
            return { success: false, error: "You are already on duty!" };
        }

        const username = session.user.name || session.user.email || 'Unknown';

        await DutySession.create({
            userId: userId,
            username: username,
            startTime: Date.now()
        });

        revalidatePath('/dashboard');
        return { success: true };

    } catch (error: any) {
        console.error("Clock In Error:", error);
        return { success: false, error: "Failed to clock in" };
    }
}

export async function clockOut() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        await connectToDatabase();

        const userId = String(session.user.id).trim();
        const existingSession = await DutySession.findOneAndDelete({ userId: userId });

        if (!existingSession) {
            return { success: false, error: "You are not on duty!" };
        }

        const endTime = Date.now();
        const startTime = existingSession.startTime;
        const durationMs = endTime - startTime;

        await DutyLog.create({
            userId: session.user.id,
            username: existingSession.username,
            startTime: startTime,
            endTime: endTime,
            durationMs: durationMs
        });

        // --- Notify Discord via Bot API ---
        try {
            // Fallback to localhost if BOT_API_URL is missing, matching logActivity implementation
            const BOT_URL = process.env.BOT_API_URL || 'http://localhost:3000';

            // Fire and forget (don't block clock out if bot is down)
            fetch(`${BOT_URL}/api/duty-log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: session.user.id,
                    username: existingSession.username,
                    startTime,
                    endTime,
                    durationMs
                }),
                cache: 'no-store'
            }).catch(err => console.error("Failed to send Duty Log to Discord Bot:", err));

        } catch (botError) {
            console.error("Bot API Trigger Error (Ignored):", botError);
        }
        // ----------------------------------

        revalidatePath('/dashboard');
        return { success: true, durationMs };

    } catch (error: any) {
        console.error("Clock Out Error:", error);
        return { success: false, error: "Failed to clock out" };
    }
}
