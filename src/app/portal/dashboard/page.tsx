import { getDashboardData } from '@/actions/dashboard';
import connectToDatabase from '@/lib/db';
import { auth } from '@/auth';
import { PortalDashboardClient } from '@/components/dashboard/PortalDashboardClient';
import { LogoutButton } from '@/components/dashboard/LogoutButton';
import { Badge } from '@/components/ui/badge';
import { Home } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PortalDashboardPage() {
    const session = await auth();
    const role = session?.user?.role || 'staff';

    if (!session?.user) return null;

    if (role === 'applicant') {
        const { redirect } = await import('next/navigation');
        redirect('/apply');
    }

    await connectToDatabase();

    let currentUser = await (await import('@/models/Employee')).default.findOne({
        userId: session.user.id
    }).lean();

    if (!currentUser) {
        currentUser = await (await import('@/models/Employee')).default.findOne({
            username: { $regex: new RegExp(`^${session.user.name}$`, 'i') }
        }).lean();
    }

    if (!currentUser) {
        console.warn(`User ${session.user.name} (${session.user.id}) not found in Employee DB, using fallback.`);
        currentUser = {
            username: session.user.name,
            xp: 0,
            level: 1,
            achievements: [],
            role: role
        } as any;
    }

    const data = await getDashboardData();
    const { activeStaff, error } = data;

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center p-4 bg-background">
                <div className="w-full max-w-md p-6 border rounded-xl border-destructive/50 bg-destructive/10">
                    <h2 className="text-xl font-bold text-destructive mb-2">Error Loading Portal</h2>
                    <p className="text-muted-foreground">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-4 md:p-8 pb-20 flex justify-center w-full bg-background relative overflow-hidden">
            {/* Background animated blobs for modern feel */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px] animate-pulse z-0 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] animate-pulse z-0 hidden md:block pointer-events-none"></div>

            <div className="max-w-[1400px] w-full space-y-6 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full bg-black/40 p-4 rounded-xl border border-white/5 backdrop-blur-md">
                    <div>
                        <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-1 flex items-center gap-2">
                            Employee Portal
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Secure Access Terminal
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/70 hover:text-white">
                            <Home className="w-4 h-4" />
                        </Link>
                        <Badge variant="outline" className="glass-card px-3 py-1 text-xs font-mono border-accent/30 text-accent bg-accent/10">
                            {role.toUpperCase()}
                        </Badge>
                        <div className="scale-90 origin-right">
                            <LogoutButton />
                        </div>
                    </div>
                </div>

                {/* Main Content Layout */}
                <PortalDashboardClient
                    activeStaff={activeStaff}
                    userRole={role}
                    currentUser={JSON.parse(JSON.stringify(currentUser))}
                />
            </div>
        </div>
    );
}
