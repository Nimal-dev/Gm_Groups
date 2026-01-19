'use client';

import { useState } from 'react';
import { logout } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { logActivity } from '@/actions/log';
import { useSession } from 'next-auth/react';

export function LogoutButton() {
    const { data: session } = useSession();
    const [isPending, setIsPending] = useState(false);

    const handleLogout = async () => {
        setIsPending(true);
        const user = session?.user?.name || 'Unknown User';
        const role = session?.user?.role || 'Unknown Role';
        await logActivity('Logout', `User ${user} (${role}) logged out via Dashboard.`, user, role);
        await logout();
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
