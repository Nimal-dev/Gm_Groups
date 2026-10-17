const BOT_URL = process.env.BOT_API_URL || process.env.NEXT_PUBLIC_BOT_URL || 'http://127.0.0.1:3000';
const BOT_SECRET = process.env.BOT_API_SECRET || '';

/**
 * Netlify's free-tier synchronous functions are killed at 10s, so a request to a
 * cold Render instance must fail fast with a readable error instead of a 504.
 */
const DEFAULT_TIMEOUT_MS = Number(process.env.BOT_API_TIMEOUT_MS) || 8500;

export class BotApiTimeoutError extends Error {
    constructor(path: string, timeoutMs: number) {
        super(`The bot server did not answer ${path} within ${Math.round(timeoutMs / 1000)}s. It may be waking up from sleep, please retry in a moment.`);
        this.name = 'BotApiTimeoutError';
    }
}

/**
 * Authenticated Fetch to Bot API
 */
export async function fetchBot(endpoint: string, options: RequestInit & { timeoutMs?: number } = {}) {
    // Ensure endpoint has leading slash
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;

    // Merge headers safely
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-api-secret': BOT_SECRET,
        ...(fetchOptions.headers as Record<string, string>)
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(`${BOT_URL}${path}`, {
            ...fetchOptions,
            headers,
            signal: fetchOptions.signal ?? controller.signal
        });
        return response;
    } catch (error: any) {
        if (error?.name === 'AbortError') {
            const timeoutError = new BotApiTimeoutError(path, timeoutMs);
            console.error(`[Bot API] ${timeoutError.message}`);
            throw timeoutError;
        }
        console.error(`[Bot API] Error fetching ${BOT_URL}${path}:`, error);
        throw error;
    } finally {
        clearTimeout(timer);
    }
}
