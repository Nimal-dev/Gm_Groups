'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';

export function LogoutButton() {
    const [isPending, setIsPending] = useState(false);

    const handleLogout = async () => {
        setIsPending(true);
        // Prevent auto-redirect to keep domain context, then manually redirect
        await signOut({ redirect: false });
        window.location.href = '/';
    };

    return (
        <Button
            variant="destructive"
            size="sm"
            className="gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
            onClick={handleLogout}
            disabled={isPending}
        >
            {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <LogOut className="w-4 h-4" />
            )}
            {isPending ? 'Signing Out...' : 'Sign Out'}
        </Button>
    );
}
