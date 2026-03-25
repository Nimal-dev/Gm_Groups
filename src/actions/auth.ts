'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { logActivity } from '@/actions/log';

// authenticate function removed as Credentials login is deprecated.

export async function discordLogin() {
    await signIn('discord');
}

export async function mpinLogin(prevState: any, formData: FormData) {
    try {
        await signIn('credentials', {
            nickname: formData.get('nickname'),
            mpin: formData.get('mpin'),
            redirectTo: '/dashboard'
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { error: 'Invalid Nickname or MPIN.' };
                default:
                    return { error: 'Something went wrong.' };
            }
        }
        throw error;
    }
}
