
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function LoginPage() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-black/90">
            <Card className="glass-card w-full max-w-sm">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full bg-white/10 text-white">
                            <Lock className="w-6 h-6" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
                    <CardDescription className="text-center">Enter your credentials to access the dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={dispatch} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                name="username"
                                placeholder="Username"
                                required
                                className="bg-black/20 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                name="password"
                                placeholder="Password"
                                required
                                minLength={6}
                                className="bg-black/20 border-white/10"
                            />
                        </div>
                        {errorMessage && (
                            <div className="text-red-500 text-sm text-center font-medium" aria-live="polite">
                                {errorMessage}
                            </div>
                        )}
                        <LoginButton />
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function LoginButton() {
    const { pending } = useFormStatus();

    return (
        <Button className="w-full bg-white text-black hover:bg-white/90" aria-disabled={pending}>
            {pending ? 'Logging in...' : 'Sign in'}
        </Button>
    );
}
