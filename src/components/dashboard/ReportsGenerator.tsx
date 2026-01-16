'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, FileText, Loader2, Copy } from 'lucide-react';
import { generateReportData } from '@/actions/report';
import { useToast } from '@/hooks/use-toast';

export function ReportsGenerator() {
    const { toast } = useToast();
    const [reportType, setReportType] = useState('Weekly');
    // Default to start of current week (Monday) and end of current week (Sunday)
    const today = new Date();
    const cleanDate = (d: Date) => d.toISOString().split('T')[0];

    // Simple default dates
    const [startDate, setStartDate] = useState(cleanDate(today));
    const [endDate, setEndDate] = useState(cleanDate(today));

    // Report Metadata
    const [reportTo, setReportTo] = useState('High Command');
    const [reportFrom, setReportFrom] = useState('');
    const [membersRemoved, setMembersRemoved] = useState('');

    const [loading, setLoading] = useState(false);
    const [generatedText, setGeneratedText] = useState('');

    const handleGenerate = async () => {
        if (!startDate || !endDate) {
            toast({
                variant: "destructive",
                title: "Invalid Input",
                description: "Please select valid start and end dates."
            });
            return;
        }

        setLoading(true);
        try {
            const result = await generateReportData(new Date(startDate), new Date(endDate));

            if (!result.success || !result.data) {
                throw new Error(result.error || 'Unknown error occurred');
            }

            // Pass membersRemoved to the formatter
            const report = formatReport(reportType, result.data, reportTo, reportFrom, membersRemoved);
            setGeneratedText(report);
            toast({
                title: "Report generated successfully!",
                description: "You can now copy the report below."
            });
        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Failed to generate report.",
                description: error.message || "Please check the logs for more details."
            });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!generatedText) return;
        navigator.clipboard.writeText(generatedText);
        toast({
            title: "Copied!",
            description: "Report copied to clipboard."
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Control Panel */}
            <Card className="glass-card h-fit">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-accent" /> Generate Report
                    </CardTitle>
                    <CardDescription>Select report type and date range.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Report Type</Label>
                        <Select value={reportType} onValueChange={setReportType}>
                            <SelectTrigger className="glass-input">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Weekly">Weekly Report</SelectItem>
                                <SelectItem value="Monthly">Monthly Report</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="glass-input block"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="glass-input block"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>From</Label>
                            <Input
                                placeholder="Your Name"
                                value={reportFrom}
                                onChange={(e) => setReportFrom(e.target.value)}
                                className="glass-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>To</Label>
                            <Input
                                placeholder="Recipient"
                                value={reportTo}
                                onChange={(e) => setReportTo(e.target.value)}
                                className="glass-input"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Members Removed</Label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={membersRemoved}
                            onChange={(e) => setMembersRemoved(e.target.value)}
                            className="glass-input"
                        />
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-accent text-white hover:bg-accent/80"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                        Generate Report
                    </Button>
                </CardContent>
            </Card>

            {/* Preview Panel */}
            <Card className="glass-card flex flex-col h-[600px]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>Report Preview</CardTitle>
                    <Button variant="ghost" size="sm" onClick={copyToClipboard} disabled={!generatedText}>
                        <Copy className="w-4 h-4 mr-2" /> Copy
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 p-0 relative">
                    <Textarea
                        value={generatedText}
                        readOnly
                        className="w-full h-full min-h-[500px] resize-none border-0 bg-black/30 font-mono text-sm p-4 focus-visible:ring-0"
                        placeholder="Generated report will appear here..."
                    />
                </CardContent>
            </Card>
        </div>
    );
}

function formatReport(type: string, data: any, to: string, from: string, membersRemoved: string) {
    // Format currency
    const fmt = (n: number) => `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const pad = (str: string, length: number) => str.padEnd(length);
    const padStart = (str: string, length: number) => str.padStart(length);
    const center = (str: string, width: number = 80) => {
        const padding = Math.max(0, Math.floor((width - str.length) / 2));
        return ' '.repeat(padding) + str;
    };

    const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const periodStart = new Date(data.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const periodEnd = new Date(data.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return `
${center('GM BURGERSHOT')}
${center(`${type.toUpperCase()} PERFORMANCE REVIEW`)}

REPORT METADATA
================================================================================
Date Generated: ${generatedDate}
Report Period:  ${periodStart} - ${periodEnd}
Prepared By:    ${from || '[Name]'}
Recipient:      ${to || 'High Command'}
================================================================================

FINANCIAL OVERVIEW
--------------------------------------------------------------------------------
 Metric                   | Amount
--------------------------|-----------------------------------------------------
 Total Revenue            | ${padStart(fmt(data.totalIncome), 20)}
 Total Operational Costs  | ${padStart(fmt(data.totalExpense), 20)}
--------------------------|-----------------------------------------------------
 NET OPERATIONAL PROFIT   | ${padStart(fmt(data.netProfit), 20)}
--------------------------------------------------------------------------------

HUMAN RESOURCES SUMMARY
--------------------------------------------------------------------------------
 Metric                   | Count
--------------------------|-----------------------------------------------------
 New Members              | ${padStart(data.membersAdded.toString(), 20)}
 Members Removed          | ${padStart(membersRemoved || '0', 20)}
--------------------------------------------------------------------------------

CERTIFICATION
--------------------------------------------------------------------------------
I hereby certify that the information provided in this report is accurate and
reflects the financial and operational status of GM Burgershot.

Signature: NIMAL PRINCE
Title:     Restaurant Manager
Date:      ${generatedDate}
`.replace(/^\n/, '');
}
