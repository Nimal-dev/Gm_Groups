'use server';


export async function logActivity(action: string, details: string, user: string = 'System', role: string = 'System') {
    const BOT_URL = process.env.BOT_API_URL || 'http://localhost:3000';

    try {
        // Auth removed to prevent circular dependency
        // Caller must provide context


        const response = await fetch(`${BOT_URL}/api/website-log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, user, details, role }),
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error(`Failed to log activity: ${response.statusText}`);
            return { success: false };
        }

        return { success: true };
    } catch (error) {
        console.error('Log Activity Error:', error);
        return { success: false };
    }
}
