'use client';

import { useState, useEffect } from 'react';
import { getBankLogs } from '@/actions/bank';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Filter, ArrowUpRight, ArrowDownLeft, RefreshCcw } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClientTime } from '@/components/dashboard/ClientTime';

export function BankLogsExplorer() {
    const [transactionType, setTransactionType] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days default
        to: new Date()
    });

    const [data, setData] = useState<{ logs: any[], stats: any, pagination?: any } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20; // Server defaults to 20

    // Auto-load on mount AND when filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(1);
        }, 500); // Debounce search
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionType, searchTerm, dateRange]);

    const handleSearch = async (page: number = 1) => {
        setIsLoading(true);
        // Optimistic update for page number
        setCurrentPage(page);

        try {
            const result = await getBankLogs({
                type: transactionType,
                accountId: searchTerm || undefined,
                dateRange: dateRange ? { from: dateRange.from!, to: dateRange.to! } : undefined,
                page: page,
                pageSize: ITEMS_PER_PAGE
            });

            if (result.success) {
                setData({
                    logs: result.logs,
                    stats: result.stats,
                    pagination: result.pagination
                });
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

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'DEPOSIT': return 'bg-green-500/10 text-green-500 border-green-500/50';
            case 'WITHDRAW': return 'bg-red-500/10 text-red-500 border-red-500/50';
            case 'TRANSFER': return 'bg-blue-500/10 text-blue-500 border-blue-500/50';
            default: return 'bg-white/10 text-muted-foreground';
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Stats Check - only show if searched */}
            {data && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="glass-card bg-green-500/5 border-green-500/20">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-full bg-green-500/20 text-green-500">
                                <ArrowDownLeft className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-green-400/80">Total Income</p>
                                <h3 className="text-2xl font-bold font-mono text-green-400">${data.stats.totalIncome.toLocaleString()}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card bg-red-500/5 border-red-500/20">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-full bg-red-500/20 text-red-500">
                                <ArrowUpRight className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-red-400/80">Total Expense</p>
                                <h3 className="text-2xl font-bold font-mono text-red-400">${data.stats.totalExpense.toLocaleString()}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-full bg-accent/20 text-accent">
                                <RefreshCcw className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Transactions</p>
                                <h3 className="text-2xl font-bold font-mono">{data.stats.count}</h3>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card className="glass-card flex-1 flex flex-col min-h-0">
                <CardHeader>
                    <CardTitle>Bank Transaction Logs</CardTitle>
                    <CardDescription>Search and filter global financial records.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col min-h-0">
                    {/* Filters */}
                    <div className="flex flex-col xl:flex-row gap-4 p-4 rounded-lg bg-black/20 border border-white/5">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium">Search Account</label>
                            <Input
                                placeholder="Name or Account Number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-black/20 border-white/10"
                            />
                        </div>

                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium">Transaction Type</label>
                            <Select value={transactionType} onValueChange={setTransactionType}>
                                <SelectTrigger className="bg-black/20 border-white/10">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="DEPOSIT">Deposit</SelectItem>
                                    <SelectItem value="WITHDRAW">Withdraw</SelectItem>
                                    <SelectItem value="TRANSFER">Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium">Date Range</label>
                            <DateRangePicker date={dateRange} setDate={setDateRange} />
                        </div>

                        <div className="flex items-end">
                            <Button
                                onClick={() => handleSearch(1)}
                                disabled={isLoading}
                                variant="outline"
                                className="w-full md:w-auto border-white/10 hover:bg-white/5"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border border-white/10 flex-1 overflow-hidden relative flex flex-col">
                        <div className="flex-1 overflow-y-auto">
                            <Table>
                                <TableHeader className="bg-black/20 sticky top-0 z-10">
                                    <TableRow className="hover:bg-transparent border-white/10">
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Account</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Memo / Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!hasSearched && !data ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-48 text-muted-foreground">
                                                Select filters and click "Search Logs" to view records.
                                            </TableCell>
                                        </TableRow>
                                    ) : (data?.logs || []).length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-48 text-muted-foreground">
                                                No transactions found matching criteria.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        (data?.logs || []).map((log: any) => (
                                            <TableRow key={log.transactionId} className="border-white/5 hover:bg-white/5 group h-14">
                                                <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                                                    <ClientTime timestamp={log.date} />
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={cn("text-[10px]", getTypeColor(log.transactionType))}>
                                                        {log.transactionType}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-[200px]">
                                                    <div className="font-medium truncate" title={log.accountName}>{log.accountName}</div>
                                                    <div className="text-xs text-muted-foreground font-mono">{log.accountNumber}</div>
                                                </TableCell>
                                                <TableCell className={cn("font-bold font-mono", log.transactionType !== 'WITHDRAW' ? 'text-green-400' : 'text-red-400')}>
                                                    {log.transactionType !== 'WITHDRAW' ? '+' : '-'}${log.amount.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="max-w-[300px]">
                                                    <div className="text-sm truncate opacity-80" title={log.memo}>{log.memo}</div>
                                                    {log.transferredTo && (
                                                        <div className="text-xs text-blue-300 mt-1 flex items-center gap-1">
                                                            <ArrowUpRight className="w-3 h-3" /> To: {log.transferredTo}
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Controls */}
                        {data && data.pagination && (
                            <div className="flex items-center justify-between p-4 border-t border-white/10 bg-black/20">
                                <div className="text-xs text-muted-foreground">
                                    Page {currentPage} of {Math.max(1, data.pagination.totalPages)} | Total: {data.pagination.total}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSearch(currentPage - 1)}
                                        disabled={currentPage <= 1 || isLoading}
                                        className="h-8 w-8 p-0"
                                    >
                                        &lt;
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSearch(currentPage + 1)}
                                        disabled={currentPage >= data.pagination.totalPages || isLoading}
                                        className="h-8 w-8 p-0"
                                    >
                                        &gt;
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Inline DatePicker 
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
                        numberOfMonths={1}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
