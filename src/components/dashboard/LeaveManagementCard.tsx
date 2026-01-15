'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Plane, Plus, Trash2, CalendarOff } from 'lucide-react';
import { createLeave, deleteLeave } from '@/actions/leave';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { ScrollArea } from '@/components/ui/scroll-area';

export function LeaveManagementCard({ leaves, employees }: { leaves: any[], employees: any[] }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [reason, setReason] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date()
    });

    const handleCreateLeave = async () => {
        if (!selectedEmployee || !dateRange?.from || !dateRange?.to) {
            toast({ title: 'Error', description: 'Please select an employee and date range.', variant: 'destructive' });
            return;
        }

        setIsLoading(true);
        const employee = employees.find(e => e.userId === selectedEmployee);

        const res = await createLeave({
            userId: selectedEmployee,
            username: employee ? employee.username : 'Unknown',
            startDate: dateRange.from,
            endDate: dateRange.to,
            reason
        });

        if (res.success) {
            toast({ title: 'Success', description: 'Leave request added.' });
            setOpen(false);
            setReason('');
            setSelectedEmployee('');
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' });
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this leave entry?')) return;
        const res = await deleteLeave(id);
        if (res.success) {
            toast({ title: 'Deleted', description: 'Leave entry removed.' });
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' });
        }
    };

    return (
        <Card className="glass-card flex flex-col h-[400px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Plane className="w-5 h-5 text-blue-400 transform -rotate-45" /> Staff on Leave
                    </CardTitle>
                    <CardDescription>Track active planned absences</CardDescription>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8 border-white/10 hover:bg-white/5">
                            <Plus className="w-4 h-4 mr-1" /> Add
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-black/90 border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle>Add Leave Request</DialogTitle>
                            <DialogDescription>
                                Set a leave period for a staff member.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Employee</Label>
                                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                    <SelectTrigger className="bg-white/5 border-white/10">
                                        <SelectValue placeholder="Select staff..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((e) => (
                                            <SelectItem key={e.userId} value={e.userId}>{e.username}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Date Range</Label>
                                <DateRangePicker date={dateRange} setDate={setDateRange} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Reason (Optional)</Label>
                                <Textarea
                                    className="bg-white/5 border-white/10"
                                    placeholder="e.g. Vacation, Sick Leave..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateLeave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-500">
                                {isLoading ? 'Saving...' : 'Add Leave'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
                <ScrollArea className="h-full pr-4">
                    {leaves.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                            <CalendarOff className="w-10 h-10 mb-2" />
                            <p>No staff currently on leave</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {leaves.map((leave) => (
                                <div key={leave._id} className="relative group flex flex-col p-3 rounded-lg bg-white/5 border border-white/5 hover:border-blue-500/30 transition-colors">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-blue-200">{leave.username}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(leave._id)}
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity absolute top-2 right-2"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                                        <CalendarIcon className="w-3 h-3" />
                                        <span>
                                            {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd')}
                                        </span>
                                    </div>
                                    {leave.reason && (
                                        <p className="text-xs text-muted-foreground mt-2 italic truncate">"{leave.reason}"</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

function DateRangePicker({
    className,
    date,
    setDate,
}: React.HTMLAttributes<HTMLDivElement> & { date: DateRange | undefined, setDate: any }) {
    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal bg-white/5 border-white/10",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={1}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
