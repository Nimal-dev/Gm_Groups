'use client';

import { useState } from 'react';
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
import { Loader2, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Schema (matching server action)
const EmployeeSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    username: z.string().min(1, "Username is required"),
    rank: z.string().min(1, "Rank is required"),
    status: z.enum(['Active', 'Inactive']).default('Active'),
});

type EmployeeFormValues = z.infer<typeof EmployeeSchema>;

interface EmployeeManagementProps {
    employees: any[];
}

export function EmployeeManagement({ employees }: EmployeeManagementProps) {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const filteredEmployees = employees.filter(emp =>
        emp.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.userId.includes(searchTerm) ||
        emp.rank.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const form = useForm<EmployeeFormValues>({
        resolver: zodResolver(EmployeeSchema),
        defaultValues: {
            userId: '',
            username: '',
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
            rank: 'Employee',
            status: 'Active'
        });
        setIsDialogOpen(true);
    };

    const openEditDialog = (emp: any) => {
        setEditingEmployee(emp);
        form.reset({
            userId: emp.userId,
            username: emp.username,
            rank: emp.rank,
            status: emp.status
        });
        setIsDialogOpen(true);
    };

    const onSubmit = async (data: EmployeeFormValues) => {
        setIsLoading(true);
        try {
            let result;
            if (editingEmployee) {
                result = await updateEmployee(editingEmployee.userId, data);
            } else {
                result = await addEmployee(data);
            }

            if (result.success) {
                toast({ title: "Success", description: editingEmployee ? "Employee updated" : "Employee added" });
                setIsDialogOpen(false);
            } else {
                toast({ title: "Error", description: result.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this employee?')) return;

        try {
            const result = await deleteEmployee(userId);
            if (result.success) {
                toast({ title: "Success", description: "Employee deleted" });
            } else {
                toast({ title: "Error", description: result.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Delete failed", variant: "destructive" });
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
                        placeholder="Search by name, ID or rank..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 bg-black/20 border-white/10"
                    />
                </div>

                <div className="rounded-md border border-white/10 flex-1 overflow-hidden relative">
                    <div className="h-full overflow-auto">
                        <div className="min-w-[700px]">
                            <Table>
                                <TableHeader className="bg-black/20 sticky top-0 z-10">
                                    <TableRow className="hover:bg-transparent border-white/10">
                                        <TableHead>User ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Rank</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEmployees.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                No members found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredEmployees.map((emp) => (
                                            <TableRow key={emp.userId} className="border-white/5 hover:bg-white/5">
                                                <TableCell className="font-mono text-xs text-muted-foreground">{emp.userId}</TableCell>
                                                <TableCell className="font-medium">{emp.username}</TableCell>
                                                <TableCell>{emp.rank}</TableCell>
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
                            <Label>Username / Nickname</Label>
                            <Input
                                {...form.register('username')}
                                placeholder="Dante Valestro"
                                className="bg-black/20 border-white/10"
                            />
                            {form.formState.errors.username && <p className="text-xs text-destructive">{form.formState.errors.username.message}</p>}
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
