
'use client';

import { useEffect, useState } from 'react';
import { getAllEmployees, resetLeaderboard } from '@/actions/employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Loader2, Trophy, Shield, User, RotateCcw, AlertTriangle } from 'lucide-react';
import { LevelBadge } from '@/components/dashboard/LevelBadge';

interface EmployeeType {
    id: string;
    username: string;
    rank: string;
    xp: number;
    level: number;
    achievementsCount: number;
    status: string;
}

interface AdminEmployeeTableProps {
    currentUser?: any;
    userRole?: string;
}

export function AdminEmployeeTable({ currentUser, userRole }: AdminEmployeeTableProps = {}) {
    const { toast } = useToast();
    const [employees, setEmployees] = useState<EmployeeType[]>([]);
    const [filtered, setFiltered] = useState<EmployeeType[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // Manager or above permission check
    const rank = (currentUser?.rank || '').toLowerCase();
    const canReset = userRole === 'admin' ||
        rank.includes('manager') ||
        rank.includes('management') ||
        rank.includes('owner') ||
        rank.includes('boss') ||
        rank.includes('lawyer');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!search) {
            setFiltered(employees);
        } else {
            setFiltered(employees.filter(e =>
                e.username.toLowerCase().includes(search.toLowerCase()) ||
                e.rank.toLowerCase().includes(search.toLowerCase())
            ));
        }
    }, [search, employees]);

    const loadData = async () => {
        setLoading(true);
        const res = await getAllEmployees();
        if (res.success && res.employees) {
            setEmployees(res.employees);
            setFiltered(res.employees);
        }
        setLoading(false);
    };

    const handleResetLeaderboard = async () => {
        setIsResetting(true);
        try {
            const res = await resetLeaderboard();
            if (res.success) {
                toast({
                    title: 'Leaderboard Reset',
                    description: `Successfully reset Level to 1 and XP to 0 for ${res.count ?? 'all'} employees.`,
                });
                setIsConfirmOpen(false);
                await loadData();
            } else {
                toast({
                    title: 'Reset Failed',
                    description: res.error || 'Failed to reset leaderboard.',
                    variant: 'destructive',
                });
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'An unexpected error occurred.',
                variant: 'destructive',
            });
        } finally {
            setIsResetting(false);
        }
    };

    const getRankBadgeColor = (rank: string) => {
        const r = rank.toLowerCase();
        if (r.includes('owner') || r.includes('boss')) return 'bg-red-600 text-white';
        if (r.includes('manager') || r.includes('head')) return 'bg-orange-500 text-white';
        if (r.includes('lead')) return 'bg-purple-500 text-white';
        if (r.includes('staff')) return 'bg-blue-500 text-white';
        return 'bg-gray-500 text-white';
    };

    return (
        <Card className="glass-card border-accent/20">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-accent" /> Employee Leaderboard
                </CardTitle>
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search employees..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 bg-black/20"
                        />
                    </div>
                    {canReset && (
                        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={isResetting || loading}
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-medium whitespace-nowrap gap-1.5 transition-all shadow-sm"
                                >
                                    {isResetting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <RotateCcw className="w-4 h-4" />
                                    )}
                                    <span>Reset Leaderboard</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="glass-card border border-red-500/30 bg-black/95 text-white max-w-md">
                                <AlertDialogHeader>
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-2">
                                        <AlertTriangle className="h-6 w-6" />
                                    </div>
                                    <AlertDialogTitle className="text-xl font-bold text-center">
                                        Reset Employee Leaderboard?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-muted-foreground text-center text-sm">
                                        This action will reset every employee's <strong className="text-white">Level to 1</strong> and <strong className="text-white">XP to 0</strong>.
                                        <br /><br />
                                        <span className="text-red-400 font-semibold">⚠️ This action cannot be undone.</span> Are you sure you want to proceed?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
                                    <AlertDialogCancel
                                        disabled={isResetting}
                                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                                    >
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleResetLeaderboard();
                                        }}
                                        disabled={isResetting}
                                        className="bg-red-600 hover:bg-red-700 text-white font-medium border border-red-500/50"
                                    >
                                        {isResetting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Resetting...
                                            </>
                                        ) : (
                                            'Yes, Reset Leaderboard'
                                        )}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-accent" />
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block rounded-md border border-white/10 overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-white/5">
                                    <TableRow>
                                        <TableHead className="w-[80px]">Rank</TableHead>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="text-right">Level</TableHead>
                                        <TableHead className="text-right">Total XP</TableHead>
                                        <TableHead className="text-center">Achievements</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((emp, index) => (
                                        <TableRow key={emp.id} className="hover:bg-white/5">
                                            <TableCell className="font-mono text-muted-foreground">
                                                #{index + 1}
                                            </TableCell>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <User className="w-4 h-4 opacity-50" /> {emp.username}
                                                {index === 0 && <Trophy className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                                                {index === 1 && <Trophy className="w-4 h-4 text-gray-400 fill-gray-400" />}
                                                {index === 2 && <Trophy className="w-4 h-4 text-orange-400 fill-orange-400" />}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`uppercase text-[10px] ${getRankBadgeColor(emp.rank)}`}>
                                                    {emp.rank}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center py-2">
                                                    <LevelBadge level={emp.level} size="sm" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {emp.xp.toLocaleString('en-US')}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {emp.achievementsCount > 0 ? (
                                                    <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                                                        {emp.achievementsCount} 🏆
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filtered.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                                No employees found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                            {filtered.map((emp, index) => (
                                <div key={emp.id} className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3 relative overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <div className="font-mono text-muted-foreground text-sm flex items-center gap-1">
                                                #{index + 1}
                                                {index === 0 && <Trophy className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                                                {index === 1 && <Trophy className="w-4 h-4 text-gray-400 fill-gray-400" />}
                                                {index === 2 && <Trophy className="w-4 h-4 text-orange-400 fill-orange-400" />}
                                            </div>
                                        </div>
                                        <Badge className={`uppercase text-[10px] ${getRankBadgeColor(emp.rank)}`}>
                                            {emp.rank}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="font-bold text-lg flex items-center gap-2">
                                            <User className="w-4 h-4 opacity-50" /> {emp.username}
                                        </div>
                                        <LevelBadge level={emp.level} size="sm" />
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-sm">
                                        <span className="text-muted-foreground font-mono">XP: <span className="text-white">{emp.xp.toLocaleString('en-US')}</span></span>
                                        {emp.achievementsCount > 0 && (
                                            <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 scale-90 origin-right">
                                                {emp.achievementsCount} 🏆
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {filtered.length === 0 && (
                                <div className="text-center p-8 text-muted-foreground border border-white/10 rounded-xl bg-white/5">
                                    No employees found.
                                </div>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
