'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an analytics service can be done here.
        console.error('Global Error caught:', error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground gap-4">
            <h2 className="text-4xl font-bold">Something went wrong!</h2>
            <p className="text-muted-foreground">
                {error.message || 'An unexpected error occurred.'}
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()} variant="secondary">
                    Try again
                </Button>
                <Button onClick={() => window.location.href = '/'} variant="outline">
                    Go Home
                </Button>
            </div>
        </div>
    );
}
