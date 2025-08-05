'use client';

import { generateMotd } from '@/ai/flows/generate-motd';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';

export function MotdDisplay() {
  const [motd, setMotd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMotd() {
      try {
        setLoading(true);
        const message = await generateMotd({});
        setMotd(message);
      } catch (error) {
        console.error('Failed to generate MotD:', error);
        setMotd('The city never sleeps. Neither do we.'); // Fallback message
      } finally {
        setLoading(false);
      }
    }
    fetchMotd();
  }, []);

  if (loading) {
    return <Skeleton className="w-full h-8 max-w-md bg-white/10" />;
  }

  return (
    <p className="mt-4 text-lg italic text-center text-accent animate-pulse font-headline">
      &ldquo;{motd}&rdquo;
    </p>
  );
}
