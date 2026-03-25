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
        console.log('Attempting MPIN login for Login ID:', formData.get('loginId'));
        await signIn('credentials', {
            loginId: formData.get('loginId'),
            mpin: formData.get('mpin'),
            redirectTo: '/dashboard'
        });
    } catch (error) {
        if (error instanceof AuthError) {
            console.error('AuthError during MPIN login:', error.type, error);
            switch (error.type) {
                case 'CredentialsSignin':
                    return { error: 'Invalid Login ID or MPIN.' };
                case 'CallbackRouteError':
                    return { error: 'Invalid credentials or database error.' };
                default:
                    return { error: `Auth Error: ${error.type}` };
            }
        }
        // Next.js Redirects are thrown as errors, we must re-throw them
        throw error;
    }
}
