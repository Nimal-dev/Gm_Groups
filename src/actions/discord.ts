'use server';

export async function sendReportToDiscord(content: string, type?: string) {
    try {
        const { fetchBot } = await import('@/lib/bot-api');
        const response = await fetchBot('/api/performancereport', {
            method: 'POST',
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
