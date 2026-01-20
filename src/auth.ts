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
        /**
         * JWT Callback
         * Persists user role and name into the JWT token.
         */
        async jwt({ token, user, profile }) {
            if (user) {
                token.role = user.role;
                // CRITICAL FIX: Force use of Discord ID (profile.id) if available. 
                // NextAuth sometimes generates a UUID for user.id if no adapter is present.
                token.id = (profile?.id as string) || user.id;
                token.name = user.name; // Explicitly update token name from DB
            }
            return token;
        },
        /**
         * Session Callback
         * Populates the client-side session object with role and name from the token.
         */
        async session({ session, token }) {
            if (session.user && token) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
                session.user.name = token.name; // Explicitly set session name
            }
            return session;
        },
        /**
         * SignIn Callback
         * Validates the Discord user against the Employee database.
         */
        async signIn({ user, account, profile }) {
            if (account?.provider === 'discord' && profile) {
                try {
                    await connectToDatabase();
                    // Check if the Discord User ID exists in the Employee collection
                    const employee = await Employee.findOne({ userId: profile.id, status: 'Active' });

                    if (!employee) {
                        console.log(`Access Denied: User ${profile.username} (${profile.id}) is not an active employee.`);
                        return false; // Valid Discord user, but not an employee -> Deny Access
                    }

                    // Map Rank to Website Role
                    const rank = employee.rank.toLowerCase();
                    let role = 'staff'; // Default role (Covering Staff, Recruit, Novice, etc.)

                    if (rank.includes('owner') || rank.includes('boss') || rank.includes('management') || rank.includes('manager') || rank.includes('lawyer')) {
                        role = 'admin';
                    } else if (rank.includes('head') || rank.includes('bulk') || rank.includes('lead')) {
                        role = 'bulkhead';
                    }

                    // Attach the determined role and name to the user object so it passes to the JWT/Session
                    user.role = role;
                    user.name = employee.username; // Use DB Employee Name instead of Discord Username

                    // Log the login activity
                    const BOT_URL = process.env.BOT_API_URL || 'http://localhost:3000';
                    fetch(`${BOT_URL}/api/website-log`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'Login',
                            user: employee.username,
                            details: `User ${employee.username} logged in via Discord.`,
                            role: role
                        })
                    }).catch(err => console.error('Failed to log Discord login:', err));

                    return true;
                } catch (error) {
                    console.error('Error during Discord sign-in verification:', error);
                    return false;
                }
            }
            return false; // Deny any non-Discord login attempts
        },
    },
    providers: [
        Discord({
            clientId: process.env.AUTH_DISCORD_ID,
            clientSecret: process.env.AUTH_DISCORD_SECRET,
        }),
    ],
});
