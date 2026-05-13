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

export async function portalMpinLogin(prevState: any, formData: FormData) {
    try {
        console.log('Attempting Portal MPIN login for Login ID:', formData.get('loginId'));
        await signIn('credentials', {
            loginId: formData.get('loginId'),
            mpin: formData.get('mpin'),
            redirectTo: '/portal/dashboard'
        });
    } catch (error) {
        if (error instanceof AuthError) {
            console.error('AuthError during Portal MPIN login:', error.type, error);
            switch (error.type) {
                case 'CredentialsSignin':
                    return { error: 'Invalid Login ID or MPIN.' };
                case 'CallbackRouteError':
                    return { error: 'Invalid credentials or database error.' };
                default:
                    return { error: `Auth Error: ${error.type}` };
            }
        }
        throw error;
    }
}

export async function vendorMpinLogin(prevState: any, formData: FormData) {
    try {
        console.log('Attempting Vendor MPIN login for Vendor ID:', formData.get('vendorId'), 'MPIN length:', formData.get('mpin')?.toString()?.length);
        await signIn('vendor-mpin', {
            vendorId: formData.get('vendorId'),
            mpin: formData.get('mpin'),
            redirectTo: '/vendor-dashboard'
        });
        console.log('Vendor MPIN login succeeded (should redirect now)');
    } catch (error: any) {
        console.error('Vendor MPIN Login caught an error:', error?.constructor?.name, error?.message, error?.type);
        if (error?.constructor?.name === 'NEXT_REDIRECT') {
            console.log('It is a NEXT_REDIRECT, throwing it back');
            throw error;
        }
        if ((error instanceof Error && error.name === 'AuthError') || error?.type) {
            console.error('AuthError during Vendor MPIN login:', error.type);
            switch (error.type) {
                case 'CredentialsSignin':
                    return { error: 'Invalid Vendor ID or MPIN.' };
                case 'CallbackRouteError':
                    return { error: 'Invalid credentials' };
                default:
                    return { error: `Auth Error: ${error.type}` };
            }
        }
        throw error;
    }
}
