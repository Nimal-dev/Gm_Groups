'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Users, Shield } from 'lucide-react';

export function VendorManagement() {
    const { toast } = useToast();
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ name: '', vendorId: '', mpin: '', role: 'MLB' });

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const mod = await import('@/actions/vendor');
            const res = await mod.listVendorUsers();
            if (res.success) setVendors(res.vendors);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { fetchVendors(); }, []);

    const handleCreate = async () => {
        if (!form.name || !form.vendorId || !form.mpin || !form.role) {
            toast({ title: 'Error', description: 'All fields are required.', variant: 'destructive' });
            return;
        }
        setCreating(true);
        try {
            const mod = await import('@/actions/vendor');
            const res = await mod.createVendorUser(form);
            if (res.success) {
                toast({ title: 'Vendor Created', className: 'bg-green-600 border-none' });
                setForm({ name: '', vendorId: '', mpin: '', role: 'MLB' });
                fetchVendors();
            } else throw new Error(res.error);
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
        setCreating(false);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete vendor "${name}"? This cannot be undone.`)) return;
        try {
            const mod = await import('@/actions/vendor');
            const res = await mod.deleteVendorUser(id);
            if (res.success) {
                toast({ title: 'Vendor Deleted', className: 'bg-green-600 border-none' });
                fetchVendors();
            } else throw new Error(res.error);
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
    };

    const mlbVendors = vendors.filter(v => v.role === 'MLB');
    const ykzVendors = vendors.filter(v => v.role === 'YKZ');

    return (
        <div className="space-y-6">
            {/* Create Vendor Form */}
            <Card className="glass-card border-emerald-500/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Plus className="w-5 h-5 text-emerald-400" /> Create Vendor Account
                    </CardTitle>
                    <CardDescription>Add a new MLB or YKZ vendor user.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                        <div className="space-y-1">
                            <Label className="text-xs text-zinc-400 uppercase">Name</Label>
                            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                className="bg-white/5 border-white/10 text-white" placeholder="Vendor Name" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-zinc-400 uppercase">Vendor ID</Label>
                            <Input value={form.vendorId} onChange={e => setForm(p => ({ ...p, vendorId: e.target.value }))}
                                className="bg-white/5 border-white/10 text-white" placeholder="Unique Login ID" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-zinc-400 uppercase">MPIN</Label>
                            <Input value={form.mpin} onChange={e => setForm(p => ({ ...p, mpin: e.target.value }))}
                                className="bg-white/5 border-white/10 text-white" placeholder="4-6 digits" maxLength={6} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-zinc-400 uppercase">Role</Label>
                            <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v }))}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-black/90 border-white/10 text-white">
                                    <SelectItem value="MLB" className="focus:bg-white/10 cursor-pointer">MLB</SelectItem>
                                    <SelectItem value="YKZ" className="focus:bg-white/10 cursor-pointer">YKZ</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleCreate} disabled={creating} className="bg-emerald-600 hover:bg-emerald-500 text-white h-10">
                            {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                            Create
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Vendor List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* MLB */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Shield className="w-4 h-4 text-blue-400" /> MLB Vendors
                            <Badge variant="outline" className="ml-auto text-blue-400 border-blue-500/50">{mlbVendors.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-blue-400" /></div>
                        ) : mlbVendors.length === 0 ? (
                            <p className="text-center py-6 text-sm text-muted-foreground">No MLB vendors yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {mlbVendors.map(v => (
                                    <div key={v._id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                        <div>
                                            <p className="font-semibold text-sm text-white">{v.name}</p>
                                            <p className="text-xs text-muted-foreground font-mono">ID: {v.vendorId}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:bg-red-500/10"
                                            onClick={() => handleDelete(v._id, v.name)}>
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* YKZ */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Shield className="w-4 h-4 text-purple-400" /> YKZ Vendors
                            <Badge variant="outline" className="ml-auto text-purple-400 border-purple-500/50">{ykzVendors.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-purple-400" /></div>
                        ) : ykzVendors.length === 0 ? (
                            <p className="text-center py-6 text-sm text-muted-foreground">No YKZ vendors yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {ykzVendors.map(v => (
                                    <div key={v._id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                        <div>
                                            <p className="font-semibold text-sm text-white">{v.name}</p>
                                            <p className="text-xs text-muted-foreground font-mono">ID: {v.vendorId}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:bg-red-500/10"
                                            onClick={() => handleDelete(v._id, v.name)}>
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
