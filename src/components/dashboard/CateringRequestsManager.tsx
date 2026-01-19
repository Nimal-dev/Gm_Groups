'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, X, ClipboardList, Calendar, Users, AlertCircle } from 'lucide-react';
import { getCateringRequests, processCateringRequest } from '@/actions/catering';
import { ScrollArea } from '@/components/ui/scroll-area';

export function CateringRequestsManager() {
    const { toast } = useToast();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null); // RequestID being processed

    // Decline Modal State
    const [declineId, setDeclineId] = useState<string | null>(null);
    const [declineReason, setDeclineReason] = useState('');

    const fetchRequests = async () => {
        setLoading(true);
        const res = await getCateringRequests();
        if (res.success) {
            setRequests(res.requests);
        } else {
            toast({ title: 'Error', description: 'Failed to load requests.', variant: 'destructive' });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (requestId: string, action: 'accept' | 'decline', reason?: string) => {
        setActionLoading(requestId);

        const res = await processCateringRequest(requestId, action, reason);

        setActionLoading(null);
        if (declineId) {
            setDeclineId(null);
            setDeclineReason('');
        }

        if (res.success) {
            toast({
                title: action === 'accept' ? 'Request Accepted' : 'Request Declined',
                description: res.message,
                className: action === 'accept' ? 'bg-green-600 border-none' : 'bg-red-600 border-none'
            });
            // Refresh list
            setRequests(prev => prev.filter(r => r._id !== requestId));
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' });
        }
    };

    if (loading) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin w-8 h-8 text-muted-foreground" /></div>;
    }

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-accent" /> Pending Event Requests
                </CardTitle>
                <CardDescription>Review and manage incoming Event requests from the website.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                    {requests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground opacity-50">
                            <Check className="w-10 h-10 mb-2" />
                            <p>All caught up! No pending requests.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((req) => (
                                <div key={req._id} className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-lg">{req.orgName}</h3>
                                                <Badge variant="outline" className={req.daysNotice <= 2 ? "border-red-500 text-red-400 bg-red-500/10" : "border-blue-500 text-blue-400"}>
                                                    {req.daysNotice} Days Notice
                                                </Badge>
                                                <Badge variant="secondary" className="bg-white/10">{req.club}</Badge>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-3 h-3" /> Rep: <span className="text-white font-mono">{req.repName}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3 h-3" /> Date: <span className="text-white font-mono">{req.eventDate} {req.eventTime}</span>
                                                </div>
                                                <div className="flex items-center gap-2 col-span-2">
                                                    <AlertCircle className="w-3 h-3" /> Surcharge: <span className="text-orange-400 font-mono">{req.surcharge || 'None'}</span>
                                                </div>
                                            </div>

                                            <div className="mt-2 p-2 rounded bg-black/20 text-sm font-mono whitespace-pre-wrap border border-white/5">
                                                <span className="text-muted-foreground text-xs block mb-1">Items Requested:</span>
                                                {req.items}
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col gap-2 justify-center md:min-w-[120px]">
                                            <Button
                                                onClick={() => handleAction(req._id, 'accept')}
                                                disabled={!!actionLoading}
                                                className="bg-green-600 hover:bg-green-700 w-full"
                                            >
                                                {actionLoading === req._id ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4 mr-2" />}
                                                Accept
                                            </Button>

                                            <Button
                                                onClick={() => setDeclineId(req._id)}
                                                disabled={!!actionLoading}
                                                variant="destructive"
                                                className="w-full"
                                            >
                                                <X className="w-4 h-4 mr-2" /> Decline
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Decline Dialog */}
                <Dialog open={!!declineId} onOpenChange={(open) => !open && setDeclineId(null)}>
                    <DialogContent className="bg-[#1a1a1a] border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle>Decline Request</DialogTitle>
                            <DialogDescription>Please provide a reason for declining this request. This will be sent to the user.</DialogDescription>
                        </DialogHeader>
                        <Textarea
                            value={declineReason}
                            onChange={(e) => setDeclineReason(e.target.value)}
                            placeholder="Reason for declining..."
                            className="bg-black/20 border-white/10 min-h-[100px]"
                        />
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setDeclineId(null)}>Cancel</Button>
                            <Button
                                variant="destructive"
                                onClick={() => declineId && handleAction(declineId, 'decline', declineReason)}
                                disabled={!declineReason.trim() || !!actionLoading}
                            >
                                {actionLoading === declineId ? <Loader2 className="animate-spin w-4 h-4" /> : "Confirm Decline"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
