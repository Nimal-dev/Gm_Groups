'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';


// authenticate function removed as Credentials login is deprecated.

export async function discordLogin(formData?: FormData) {
    const callbackUrl = formData?.get('callbackUrl') as string | undefined;
    await signIn('discord', { redirectTo: callbackUrl || '/dashboard' });
}

export async function logout() {
    await signOut({ redirectTo: '/login' });
}
