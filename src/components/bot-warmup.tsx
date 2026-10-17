'use client';

import { useEffect } from 'react';

/**
 * Render's free tier puts the bot to sleep after 15 minutes without traffic and takes
 * 30-60s to wake. Pinging it as soon as a login page opens means it is usually awake by
 * the time the user submits a form that needs it.
 *
 * Does nothing unless NEXT_PUBLIC_BOT_URL is set.
 */
export function BotWarmup() {
    useEffect(() => {
        const botUrl = process.env.NEXT_PUBLIC_BOT_URL;
        if (!botUrl) return;

        const controller = new AbortController();
        fetch(`${botUrl.replace(/\/$/, '')}/health`, {
            mode: 'no-cors',
            cache: 'no-store',
            signal: controller.signal,
            keepalive: true,
        }).catch(() => {
            // Best effort only: a failed ping must never affect the page.
        });

        return () => controller.abort();
    }, []);

    return null;
}
