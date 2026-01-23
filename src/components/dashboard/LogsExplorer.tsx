'use client';

import { useState } from 'react';
import { getDutyLogs } from '@/actions/logs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogsExplorerProps {
    employees: any[];
}

export function LogsExplorer({ employees }: LogsExplorerProps) {
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 7)), // Last 7 days
        to: new Date()
    });
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        setIsLoading(true);
        try {
            const result = await getDutyLogs(
                selectedUser === 'all' ? null : selectedUser,
                dateRange ? { from: dateRange.from!, to: dateRange.to! } : undefined
            );

            if (result.success) {
                setLogs(result.logs);
            } else {
                console.error(result.error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
            setHasSearched(true);
        }
    };

    const formatDuration = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    return (
        <Card className="glass-card h-full flex flex-col">
            <CardHeader>
                <CardTitle>Advanced Log Explorer</CardTitle>
                <CardDescription>Filter duty logs by staff member and date.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col min-h-0">
                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-4 p-4 rounded-lg bg-black/20 border border-white/5">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">Staff Member</label>
                        <Select value={selectedUser} onValueChange={setSelectedUser}>
                            <SelectTrigger className="bg-black/20 border-white/10">
                                <SelectValue placeholder="All Staff" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Staff</SelectItem>
                                {employees.map(e => (
                                    <SelectItem key={e.userId} value={e.userId}>{e.username}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">Date Range</label>
                        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                    </div>

                    <div className="flex items-end">
                        <Button
                            onClick={handleSearch}
                            disabled={isLoading}
                            className="bg-accent text-white w-full md:w-auto"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4 mr-2" />}
                            Fetch Logs
                        </Button>
                    </div>
                </div>

                {/* Results Table */}
                <div className="rounded-md border border-white/10 flex-1 overflow-hidden relative">
                    <div className="h-full overflow-auto">
                        <div className="min-w-[600px]">
                            <Table>
                                <TableHeader className="bg-black/20 sticky top-0 z-10">
                                    <TableRow className="hover:bg-transparent border-white/10">
                                        <TableHead>Staff Name</TableHead>
                                        <TableHead>Start Time</TableHead>
                                        <TableHead>End Time</TableHead>
                                        <TableHead>Duration</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!hasSearched && logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                Select filters and click "Fetch Logs" to view history.
                                            </TableCell>
                                        </TableRow>
                                    ) : logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                No logs found for the selected criteria.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <>
                                            {logs.map((log: any) => (
                                                <TableRow key={log._id} className={cn("border-white/5 hover:bg-white/5", log.isValid === false && "opacity-50 bg-destructive/10")}>
                                                    <TableCell className="font-medium">
                                                        {log.username}
                                                        {log.isValid === false && <span className="ml-2 text-xs text-destructive font-bold">(Invalid)</span>}
                                                    </TableCell>
                                                    <TableCell>{new Date(log.startTime).toLocaleString()}</TableCell>
                                                    <TableCell>{new Date(log.endTime).toLocaleString()}</TableCell>
                                                    <TableCell className={cn("font-mono", log.isValid === false ? "text-destructive" : "text-accent")}>
                                                        {formatDuration(log.durationMs)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {/* Total Duration Footer */}
                                            <TableRow className="bg-accent/10 border-t border-accent/20 font-bold hover:bg-accent/10">
                                                <TableCell colSpan={3} className="text-right text-accent">Total Duration (Valid Only):</TableCell>
                                                <TableCell className="font-mono text-accent text-lg">
                                                    {formatDuration(logs
                                                        .filter((log: any) => log.isValid !== false) // Filter out invalid
                                                        .reduce((acc, log) => acc + (log.durationMs || 0), 0)
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        </>
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

// Inline DatePicker in case standard one missing
function DatePickerWithRange({
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
                            "w-full justify-start text-left font-normal bg-black/20 border-white/10",
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
                        numberOfMonths={1} // Keep simple for mobile
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
