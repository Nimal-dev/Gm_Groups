
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    secret: process.env.AUTH_SECRET || 'fallback_secret_for_dev_only_12345',
    trustHost: true,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ username: z.string(), password: z.string().min(1) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { username, password } = parsedCredentials.data;

                    try {
                        await connectToDatabase();
                        // Find user by username
                        const user = await User.findOne({ username });

                        // Check if user exists and password matches (PLAIN TEXT)
                        if (user && user.password === password) {
                            return {
                                id: user._id.toString(),
                                name: user.username,
                                role: user.role,
                            };
                        }
                    } catch (error) {
                        console.error('Database auth error:', error);
                    }

                    // Fallback: Admin Credential
                    if (username === 'Nimal' && password === 'Nimal@gm6814') {
                        return {
                            id: '1',
                            name: 'Admin User',
                            email: 'admin@gm.groups',
                            role: 'admin',
                        };
                    }

                    // Fallback: Staff Credential
                    if (username === 'Staff' && password === 'Staff@gm123') {
                        return {
                            id: '2',
                            name: 'Staff Member',
                            email: 'staff@gm.groups',
                            role: 'staff',
                        };
                    }

                    // Fallback: Bulkhead Credential
                    if (username === 'Bulkhead' && password === 'Bulkhead@gm123') {
                        return {
                            id: '3',
                            name: 'Bulkhead Manager',
                            email: 'bulkhead@gm.groups',
                            role: 'bulkhead',
                        };
                    }
                }

                return null;
            },
        }),
    ],
});
