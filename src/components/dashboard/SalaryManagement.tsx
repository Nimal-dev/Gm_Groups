'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, DollarSign, Send, Copy, Check } from 'lucide-react';
import { logPayment } from '@/actions/salary';

interface PayrollManagementProps {
    employees: any[];
}

export function PayrollManagement({ employees }: PayrollManagementProps) {
    const { toast } = useToast();
    const [loadingState, setLoadingState] = useState<{ [userId: string]: boolean }>({});
    const [inputs, setInputs] = useState<{ [userId: string]: { amount: string, note: string } }>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Filter only active employees
    const activeEmployees = employees.filter(e => e.status === 'Active');

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast({ description: "Bank account copied to clipboard" });
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleInputChange = (userId: string, field: 'amount' | 'note', value: string) => {
        setInputs(prev => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [field]: value
            }
        }));
    };

    const handlePay = async (employee: any) => {
        const userId = employee.userId;
        const input = inputs[userId];

        if (!input || !input.amount || isNaN(Number(input.amount)) || Number(input.amount) <= 0) {
            toast({ title: "Invalid Amount", description: "Please enter a valid amount.", variant: "destructive" });
            return;
        }

        setLoadingState(prev => ({ ...prev, [userId]: true }));

        try {
            const result = await logPayment(userId, Number(input.amount), input.note);

            if (result.success) {
                toast({
                    title: "Payment Successful",
                    description: `Paid $${input.amount} to ${employee.nickname || employee.username}.`
                });

                // Clear inputs for this user
                setInputs(prev => {
                    const next = { ...prev };
                    delete next[userId];
                    return next;
                });
            } else {
                toast({ title: "Payment Failed", description: result.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
        } finally {
            setLoadingState(prev => ({ ...prev, [userId]: false }));
        }
    };

    return (
        <Card className="glass-card h-full flex flex-col">
            <CardHeader>
                <CardTitle>Payroll Management</CardTitle>
                <CardDescription>Process salary payments for active GM Staff.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col min-h-0">
                <div className="rounded-md border border-white/10 flex-1 overflow-hidden relative">
                    <div className="h-full overflow-auto">
                        <div className="min-w-[800px]">
                            <Table>
                                <TableHeader className="bg-black/20 sticky top-0 z-10">
                                    <TableRow className="hover:bg-transparent border-white/10">
                                        <TableHead className="w-[20%]">Employee</TableHead>
                                        <TableHead className="w-[15%]">Rank</TableHead>
                                        <TableHead className="w-[20%]">Bank Account</TableHead>
                                        <TableHead className="w-[20%]">Amount ($)</TableHead>
                                        <TableHead className="w-[20%]">Note</TableHead>
                                        <TableHead className="w-[10%] text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeEmployees.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                No active staff found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        activeEmployees.map((emp) => (
                                            <TableRow key={emp.userId} className="border-white/5 hover:bg-white/5">
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-white">
                                                            {emp.nickname ? emp.nickname : emp.username}
                                                        </span>
                                                        {emp.nickname && (
                                                            <span className="text-xs text-muted-foreground">({emp.username})</span>
                                                        )}
                                                        <span className="text-xs font-mono text-muted-foreground">{emp.userId}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-xs border-white/20">
                                                        {emp.rank}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm">
                                                            {emp.bankAccountNo || 'Not Set'}
                                                        </span>
                                                        {emp.bankAccountNo && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-muted-foreground hover:text-white"
                                                                onClick={() => handleCopy(emp.bankAccountNo, emp.userId)}
                                                            >
                                                                {copiedId === emp.userId ? (
                                                                    <Check className="h-3 w-3 text-green-500" />
                                                                ) : (
                                                                    <Copy className="h-3 w-3" />
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            className="pl-8 bg-black/20 border-white/10"
                                                            value={inputs[emp.userId]?.amount || ''}
                                                            onChange={(e) => handleInputChange(emp.userId, 'amount', e.target.value)}
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        placeholder="Bonus, Salary..."
                                                        className="bg-black/20 border-white/10"
                                                        value={inputs[emp.userId]?.note || ''}
                                                        onChange={(e) => handleInputChange(emp.userId, 'note', e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 text-white w-full"
                                                        onClick={() => handlePay(emp)}
                                                        disabled={loadingState[emp.userId]}
                                                    >
                                                        {loadingState[emp.userId] ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                Pay <Send className="w-3 h-3 ml-1" />
                                                            </>
                                                        )}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
