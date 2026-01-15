'use client';

import { useEffect, useState } from 'react';

export function ClientTime({ timestamp }: { timestamp: string | number | Date }) {
    const [time, setTime] = useState<string>('');

    useEffect(() => {
        setTime(new Date(timestamp).toLocaleTimeString());
    }, [timestamp]);

    // Render empty or a placeholder on server/initial mount to ensure match
    if (!time) return <span className="opacity-0">Loading...</span>;

    return <span>{time}</span>;
}
