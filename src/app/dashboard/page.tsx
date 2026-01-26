import { getDashboardData } from '@/actions/dashboard';
import { ClientTime } from '@/components/dashboard/ClientTime';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, ShoppingCart, DollarSign, Activity, FileText } from 'lucide-react';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { LogoutButton } from '@/components/dashboard/LogoutButton';

export const dynamic = 'force-dynamic'; // Ensure real-time data

import { auth } from '@/auth';

export default async function DashboardPage() {
    const session = await auth();
    const role = session?.user?.role || 'staff'; // Default to staff if role is missing but authorized

    // Safety check - although middleware handles this, good to have redundancy
    if (!session?.user) return null;

    const data = await getDashboardData();
    const { activeStaff, activeOrders, allEmployees, recentSalaries, recurringOrders, error } = data; // Added recurringOrders

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center p-4">
                <Card className="glass-card border-destructive/50 w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    // Calculate Stats
    const totalStaff = allEmployees.length;
    const activeStaffCount = activeStaff.length;
    const pendingOrders = activeOrders.filter((o: any) => o.status === 'Pending').length;
    const inProgressOrders = activeOrders.filter((o: any) => o.status === 'In Progress').length || activeOrders.filter((o: any) => o.status === 'Processing').length;
    const readyOrders = activeOrders.filter((o: any) => o.status === 'Ready').length;

    // Destructure activeLeaves
    const { activeLeaves } = data;

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-8 pb-20">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-2">
                        Command Center
                    </h1>
                    <p className="text-muted-foreground">
                        {role === 'admin' ? 'Full operational control & oversight.' : 'Staff operations dashboard.'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <LogoutButton />
                    <Badge variant="outline" className="glass-card px-4 py-1 text-xs font-mono">
                        Role: {role.toUpperCase()}
                    </Badge>
                </div>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">

                {role === 'admin' && (
                    <>
                        <StatsCard
                            title="Company Balance"
                            value={`$${(data.bankStats?.currentBalance || 0).toLocaleString('en-US')}`}
                            subtitle="Live Available Funds"
                            icon={<DollarSign className="w-5 h-5 text-yellow-400" />}
                            glow
                        />

                        <StatsCard
                            title="Current Month Income"
                            value={`$${(data.bankStats?.totalIncome || 0).toLocaleString('en-US')}`}
                            subtitle="Total Deposits"
                            icon={<Activity className="w-5 h-5 text-green-400" />}
                        />

                        <StatsCard
                            title="Current Month Expense"
                            value={`$${(data.bankStats?.totalExpense || 0).toLocaleString('en-US')}`}
                            subtitle="Withdrawals & Transfers"
                            icon={<Activity className="w-5 h-5 text-red-400" />}
                        />
                    </>
                )}

                <StatsCard
                    title="Active Duty"
                    value={activeStaffCount}
                    subtitle={`${activeStaffCount > 0 ? 'Staff currently online' : 'No staff online'}`}
                    icon={<Users className="w-5 h-5 text-accent" />}
                />

                <StatsCard
                    title="Pending Orders"
                    value={pendingOrders}
                    subtitle="Require immediate attention"
                    icon={<ShoppingCart className="w-5 h-5 text-orange-400" />}
                />

                <StatsCard
                    title="Active Process"
                    value={inProgressOrders + readyOrders}
                    subtitle="Orders currently in kitchen/ready"
                    icon={<Activity className="w-5 h-5 text-blue-400" />}
                />

                <StatsCard
                    title="Total Employees"
                    value={totalStaff}
                    subtitle="Registered staff members"
                    icon={<FileText className="w-5 h-5 text-green-400" />}
                />
            </div>

            {/* Main Content Tabs (Client Side) */}
            <DashboardTabs
                activeStaff={activeStaff}
                activeOrders={activeOrders}
                recurringOrders={recurringOrders || []}
                allEmployees={allEmployees}
                recentSalaries={recentSalaries}
                activeLeaves={activeLeaves || []}
                userRole={role}
            />
        </div>
    );
}

// --- Helper Components ---

function StatsCard({ title, value, subtitle, icon, glow }: any) {
    return (
        <Card className={`glass-card relative overflow-hidden group ${glow ? 'border-accent/30 shadow-[0_0_15px_rgba(124,58,237,0.1)]' : ''}`}>

            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-accent/20 group-hover:text-accent transition-colors">
                        {icon}
                    </div>
                </div>
                <div className="space-y-1">
                    <h3 className="text-3xl font-bold font-mono">{value}</h3>
                    <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
                </div>
            </CardContent>
            {/* Glow overlay */}
            {glow && <div className="absolute inset-0 bg-accent/5 pointer-events-none animate-pulse" />}
        </Card>
    );
}
