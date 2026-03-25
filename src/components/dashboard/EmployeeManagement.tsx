'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addEmployee, updateEmployee, deleteEmployee } from '@/actions/employee';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Search, Copy, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Schema (matching server action)
const EmployeeSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    username: z.string().min(1, "Username is required"),
    nickname: z.string().optional(),
    mpin: z.string().optional(),
    rank: z.string().min(1, "Rank is required"),
    status: z.enum(['Active', 'Inactive']).default('Active'),
    bankAccountNo: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof EmployeeSchema>;

interface EmployeeManagementProps {
    employees: any[];
}

export function EmployeeManagement({ employees }: EmployeeManagementProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [localEmployees, setLocalEmployees] = useState(employees);

    useEffect(() => {
        setLocalEmployees(employees);
    }, [employees]);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast({ description: "Copied to clipboard" });
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredEmployees = localEmployees.filter(emp =>
        emp.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.nickname && emp.nickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        emp.userId.includes(searchTerm) ||
        emp.rank.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const form = useForm<EmployeeFormValues>({
        resolver: zodResolver(EmployeeSchema),
        defaultValues: {
            userId: '',
            username: '',
            nickname: '',
            rank: 'Employee',
            status: 'Active'
        }
    });

    // Reset form when opening dialog logic
    const openAddDialog = () => {
        setEditingEmployee(null);
        form.reset({
            userId: '',
            username: '',
            nickname: '',
            mpin: '',
            rank: 'Employee',
            status: 'Active',
            bankAccountNo: ''
        });
        setIsDialogOpen(true);
    };

    const openEditDialog = (emp: any) => {
        setEditingEmployee(emp);
        form.reset({
            userId: emp.userId,
            username: emp.username,
            nickname: emp.nickname || '',
            mpin: emp.mpin || '',
            rank: emp.rank,
            status: emp.status,
            bankAccountNo: emp.bankAccountNo || ''
        });
        setIsDialogOpen(true);
    };

    const onSubmit = async (data: EmployeeFormValues) => {
        setIsLoading(true);
        try {
            // Optimistic update
            const tempEmployee = { ...data, userId: data.userId || (editingEmployee ? editingEmployee.userId : '') };
            if (editingEmployee) {
                setLocalEmployees(prev => prev.map(emp => emp.userId === tempEmployee.userId ? { ...emp, ...tempEmployee } : emp));
            } else {
                setLocalEmployees(prev => [...prev, tempEmployee]);
            }
            setIsDialogOpen(false);

            let result;
            if (editingEmployee) {
                result = await updateEmployee(editingEmployee.userId, data);
            } else {
                result = await addEmployee(data);
            }

            if (result.success) {
                toast({ title: "Success", description: editingEmployee ? "Employee updated" : "Employee added" });
                router.refresh();
            } else {
                toast({ title: "Error", description: result.error, variant: "destructive" });
                setLocalEmployees(employees); // Revert state
                if (result.error.includes('Unauthorized')) {
                    setTimeout(() => window.location.reload(), 1500);
                }
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
            setLocalEmployees(employees); // Revert state
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this employee?')) return;

        // Optimistic delete
        setLocalEmployees(prev => prev.filter(emp => emp.userId !== userId));

        try {
            const result = await deleteEmployee(userId);
            if (result.success) {
                toast({ title: "Success", description: "Employee deleted" });
                router.refresh();
            } else {
                toast({ title: "Error", description: result.error, variant: "destructive" });
                setLocalEmployees(employees); // Revert state
            }
        } catch (error) {
            toast({ title: "Error", description: "Delete failed", variant: "destructive" });
            setLocalEmployees(employees); // Revert state
        }
    };

    return (
        <Card className="glass-card h-full flex flex-col">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <CardTitle>Employee Management</CardTitle>
                    <CardDescription>Manage staff roster and details.</CardDescription>
                </div>
                <Button onClick={openAddDialog} className="w-full sm:w-auto neon-button bg-accent text-white hover:bg-accent/80">
                    <Plus className="w-4 h-4 mr-2" /> Add Employee
                </Button>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col min-h-0">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, nickname, ID or rank..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 bg-black/20 border-white/10"
                    />
                </div>

                <div className="rounded-md border border-white/10 flex-1 overflow-hidden relative">
                    <div className="h-full overflow-auto">
                        <div className="min-w-[700px] hidden md:block">
                            <Table>
                                <TableHeader className="bg-black/20 sticky top-0 z-10">
                                    <TableRow className="hover:bg-transparent border-white/10">
                                        <TableHead>User ID</TableHead>
                                        <TableHead>Username</TableHead>
                                        <TableHead>MPIN</TableHead>
                                        <TableHead>Rank</TableHead>
                                        <TableHead>Bank Account</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEmployees.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                                No members found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredEmployees.map((emp) => (
                                            <TableRow key={emp.userId} className="border-white/5 hover:bg-white/5">
                                                <TableCell className="font-mono text-xs text-muted-foreground">{emp.userId}</TableCell>
                                                <TableCell className="font-medium">{emp.username}</TableCell>
                                                <TableCell className="font-mono text-xs">{emp.mpin || '-'}</TableCell>
                                                <TableCell>{emp.rank}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm">
                                                            {emp.bankAccountNo || '-'}
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
                                                    <Badge variant={emp.status === 'Active' ? 'secondary' : 'destructive'} className="text-xs">
                                                        {emp.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-accent" onClick={() => openEditDialog(emp)}>
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-destructive" onClick={() => handleDelete(emp.userId)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden flex flex-col gap-3 pb-4">
                            {filteredEmployees.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground bg-black/10 rounded-lg border border-white/5">No members found.</div>
                            ) : (
                                filteredEmployees.map((emp) => (
                                    <div key={emp.userId} className="bg-black/20 border border-white/5 p-4 rounded-xl flex flex-col gap-3 relative shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-semibold text-white/90 text-base">{emp.username}</div>
                                                <div className="font-mono text-[11px] text-muted-foreground/80 mt-0.5">{emp.userId}</div>
                                            </div>
                                            <Badge variant={emp.status === 'Active' ? 'secondary' : 'destructive'} className="text-[10px] h-5 px-1.5 rounded-sm">
                                                {emp.status}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-sm pt-2">
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold mb-1">Rank</div>
                                                <div className="text-white/80">{emp.rank}</div>
                                                
                                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold mb-1 mt-2">MPIN</div>
                                                <div className="text-white/80 font-mono text-xs">{emp.mpin || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold mb-1">Bank Account</div>
                                                <div className="flex items-center text-white/80">
                                                    <span>{emp.bankAccountNo || '-'}</span>
                                                    {emp.bankAccountNo && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-5 w-5 ml-1.5 text-muted-foreground hover:bg-white/10"
                                                            onClick={(e) => { e.stopPropagation(); handleCopy(emp.bankAccountNo, emp.userId); }}
                                                        >
                                                            {copiedId === emp.userId ? (
                                                                <Check className="h-3 w-3 text-green-500" />
                                                            ) : (
                                                                <Copy className="h-3 w-3" />
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-1 pt-3 border-t border-white/5 mt-1">
                                            <Button size="sm" variant="ghost" className="h-8 px-3 hover:bg-white/10 hover:text-accent rounded-md text-xs font-medium" onClick={() => openEditDialog(emp)}>
                                                <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                                            </Button>
                                            <Button size="sm" variant="ghost" className="h-8 px-3 hover:bg-red-500/10 hover:text-destructive rounded-md text-xs font-medium" onClick={() => handleDelete(emp.userId)}>
                                                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>

            {/* Dialog Form */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="glass-card border-white/10 w-[95vw] max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
                        <DialogDescription>
                            {editingEmployee ? 'Update employee details.' : 'Add a new member to the roster.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label>User ID (Discord)</Label>
                            <Input
                                {...form.register('userId')}
                                placeholder="123456789..."
                                disabled={!!editingEmployee} // Cannot change ID on edit
                                className="bg-black/20 border-white/10"
                            />
                            {form.formState.errors.userId && <p className="text-xs text-destructive">{form.formState.errors.userId.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Username</Label>
                            <Input
                                {...form.register('username')}
                                placeholder="Discord Username"
                                className="bg-black/20 border-white/10"
                            />
                            {form.formState.errors.username && <p className="text-xs text-destructive">{form.formState.errors.username.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Nickname (Display Name)</Label>
                            <Input
                                {...form.register('nickname')}
                                placeholder="Dante Valestro"
                                className="bg-black/20 border-white/10"
                            />
                            {form.formState.errors.nickname && <p className="text-xs text-destructive">{form.formState.errors.nickname.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>MPIN (Mobile Login)</Label>
                            <Input
                                {...form.register('mpin')}
                                placeholder="4-digit PIN (e.g., 1234)"
                                maxLength={10}
                                className="bg-black/20 border-white/10 font-mono"
                            />
                            {form.formState.errors.mpin && <p className="text-xs text-destructive">{form.formState.errors.mpin.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Rank</Label>
                            <Input
                                {...form.register('rank')}
                                placeholder="Trainee, Manager..."
                                className="bg-black/20 border-white/10"
                            />
                            {form.formState.errors.rank && <p className="text-xs text-destructive">{form.formState.errors.rank.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Bank Account No.</Label>
                            <Input
                                {...form.register('bankAccountNo')}
                                placeholder="Account Number"
                                className="bg-black/20 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                onValueChange={(val: any) => form.setValue('status', val)}
                                defaultValue={form.getValues('status')}
                            >
                                <SelectTrigger className="bg-black/20 border-white/10">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isLoading} className="bg-accent text-white">
                                {isLoading && <Loader2 className="w-4 h4 mr-2 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
