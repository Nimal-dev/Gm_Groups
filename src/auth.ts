// ... (imports)
import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';
import { authConfig } from './auth.config';
import connectToDatabase from '@/lib/db';
import Employee from '@/models/Employee';

/**
 * NextAuth Configuration
 * 
 * Handles authentication via Discord OAuth.
 * - Verifies user existence in the internal `Employee` database.
 * - Assigns roles (Admin, Bulkhead, Staff) based on Employee Rank.
 * - Logs login activity to the central bot logging system.
 * - Persists Employee Name and Role in the session.
 */
export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    callbacks: {
        ...authConfig.callbacks,
        /**
         * JWT Callback
         * Persists user role and name into the JWT token.
         */
        async jwt({ token, user, profile }) {
            if (user && profile) {
                try {
                    await connectToDatabase();

                    const employee = await Employee.findOne({ userId: profile.id, status: 'Active' });


                    if (employee) {
                        const rank = employee.rank.toLowerCase();
                        let role = 'staff';


                        if (rank.includes('owner') || rank.includes('boss') || rank.includes('management') || rank.includes('manager') || rank.includes('lawyer')) {
                            role = 'admin';
                        } else if (rank.includes('head') || rank.includes('bulk') || rank.includes('lead')) {
                            role = 'bulkhead';
                        }


                        token.role = role;
                        token.name = employee.username;
                    } else {

                        token.role = 'client';
                        token.name = (profile as any).username || (profile as any).global_name || 'Client';
                    }
                    token.id = profile.id;

                    // Log the login activity
                    const BOT_URL = process.env.BOT_API_URL || 'http://localhost:3000';
                    fetch(`${BOT_URL}/api/website-log`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'Login',
                            user: token.name,
                            details: `User ${token.name} logged in via Discord.`,
                            role: token.role
                        })
                    }).catch(err => console.error('Failed to log Discord login:', err));

                } catch (error) {
                    console.error('Error in JWT callback:', error);
                    token.role = 'client'; // Fallback
                    token.name = (profile as any).username || 'Client';
                }
            }
            return token;
        },

        async signIn({ user, account, profile }) {
            // We authorize everyone, role is handled in JWT
            return true;
        },
    },
    providers: [
        Discord({
            clientId: process.env.AUTH_DISCORD_ID,
            clientSecret: process.env.AUTH_DISCORD_SECRET,
        }),
    ],
});
