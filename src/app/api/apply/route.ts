import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { fetchBot } from '@/lib/bot-api';

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();

        // Pass along the Discord ID and the accessToken so the bot can force-join them to the guild
        const payload = {
            ...data,
            discordId: session.user.id,
            // @ts-ignore
            accessToken: session.accessToken,
        };

        // Forward to the Bot's HTTP server
        const botResponse = await fetchBot('/api/recruitment-apply', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (!botResponse.ok) {
            const errorData = await botResponse.json().catch(() => ({}));
            throw new Error(errorData.error || `Bot returned status: ${botResponse.status}`);
        }

        return NextResponse.json({ success: true, message: 'Application submitted successfully' });

    } catch (error: any) {
        console.error('[API /api/apply] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error while submitting application' },
            { status: 500 }
        );
    }
}
