'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { logActivity } from '@/actions/log';

// authenticate function removed as Credentials login is deprecated.

export async function discordLogin() {
    await signIn('discord');
}
