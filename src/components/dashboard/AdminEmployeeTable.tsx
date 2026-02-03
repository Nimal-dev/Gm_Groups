
'use client';

import { useEffect, useState } from 'react';
import { getAllEmployees } from '@/actions/employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Trophy, Shield, User } from 'lucide-react';
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

export function AdminEmployeeTable() {
    const [employees, setEmployees] = useState<EmployeeType[]>([]);
    const [filtered, setFiltered] = useState<EmployeeType[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

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
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-accent" /> Employee Leaderboard
                </CardTitle>
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search employees..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 bg-black/20"
                    />
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-accent" />
                    </div>
                ) : (
                    <div className="rounded-md border border-white/10 overflow-hidden">
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
                )}
            </CardContent>
        </Card>
    );
}
