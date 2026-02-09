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
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // 7 Days
    },
    callbacks: {
        /**
         * JWT Callback
         * Persists user role and name into the JWT token.
         * Handles Token Rotation.
         */
        async jwt({ token, user, account, profile }) {
            // Initial Sign In
            if (account && user) {
                return {
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    expiresAt: Date.now() + (account.expires_in as number * 1000),
                    user: {
                        ...user,
                        id: (profile?.id as string) || user.id, // CRITICAL FIX: Force use of Discord ID
                        name: user.name, // Explicitly update token name from DB
                        role: user.role,
                    }
                };
            }

            // Return previous token if the access token has not expired yet
            if (Date.now() < (token.expiresAt as number)) {
                return token;
            }

            // Access token has expired, try to update it
            return await refreshAccessToken(token);
        },
        /**
         * Session Callback
         * Populates the client-side session object with role and name from the token.
         */
        async session({ session, token }) {
            // Check if rotation failed
            if (token.error) {
                // @ts-ignore
                session.error = token.error;
            }

            if (session.user && token.user) {
                // @ts-ignore
                session.user = {
                    ...session.user,
                    ...token.user as any
                };
                // Ensure ID is set correctly
                // @ts-ignore
                session.user.id = (token.user as any).id;
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
                        console.warn(`Access Denied: User ${profile.username} (${profile.id}) is not an active employee.`);
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
                    const { fetchBot } = await import('@/lib/bot-api');
                    fetchBot('/api/website-log', {
                        method: 'POST',
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
            authorization: { params: { scope: 'identify email guilds guilds.join' } }, // Use standard scopes + guilds.join if needed
        }),
    ],
});

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `expiresAt`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: any) {
    try {
        const url = 'https://discord.com/api/oauth2/token';
        const body = new URLSearchParams({
            client_id: process.env.AUTH_DISCORD_ID!,
            client_secret: process.env.AUTH_DISCORD_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: token.refreshToken,
        });

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
            body: body,
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw refreshedTokens;
        }

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
        };
    } catch (error) {
        console.error('RefreshAccessTokenError', error);

        return {
            ...token,
            error: 'RefreshAccessTokenError',
        };
    }
}
