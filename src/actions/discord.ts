'use server';

export async function sendReportToDiscord(content: string, type?: string) {
    const BOT_URL = process.env.BOT_API_URL || 'http://localhost:3000';

    try {
        const response = await fetch(`${BOT_URL}/api/performancereport`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content, type }),
            cache: 'no-store'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to send report to Discord');
        }

        return { success: true, message: result.message };
    } catch (error: any) {
        console.error('Send Report Error:', error);
        return { success: false, error: error.message || 'Connection to bot failed.' };
    }
}
