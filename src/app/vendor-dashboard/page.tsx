import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

const VendorDashboardClient = dynamic(
    () => import('@/components/dashboard/VendorDashboardClient'),
    {
        loading: () => (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-muted-foreground animate-pulse text-lg">Loading Vendor Dashboard...</div>
            </div>
        )
    }
);

export default async function VendorDashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/vendor-login');
    }

    const role = (session.user as any).role as string;
    if (!role?.startsWith('vendor_')) {
        redirect('/dashboard');
    }

    const vendorRole = role.replace('vendor_', '').toUpperCase(); // MLB or YKZ

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-15%] left-[20%] w-[500px] h-[500px] bg-emerald-600/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-teal-600/8 rounded-full blur-[100px]" />
            </div>

            <main className="flex-grow px-4 py-6 md:px-8 relative z-10 w-full max-w-7xl mx-auto">
                <VendorDashboardClient
                    vendorRole={vendorRole}
                    vendorName={session.user.name || 'Vendor'}
                />
            </main>
        </div>
    );
}
