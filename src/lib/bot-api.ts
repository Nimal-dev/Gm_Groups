
const BOT_URL = process.env.BOT_API_URL || process.env.NEXT_PUBLIC_BOT_URL || 'http://127.0.0.1:3000';
const BOT_SECRET = process.env.BOT_API_SECRET || '';

/**
 * Authenticated Fetch to Bot API
 */
export async function fetchBot(endpoint: string, options: RequestInit = {}) {
    // Ensure endpoint has leading slash
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Merge headers safely
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-api-secret': BOT_SECRET,
        ...(options.headers as Record<string, string>)
    };

    try {
        const response = await fetch(`${BOT_URL}${path}`, {
            ...options,
            headers
        });
        return response;
    } catch (error) {
        console.error(`[Bot API] Error fetching ${BOT_URL}${path}:`, error);
        throw error;
    }
}
