
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';

// For this initial implementation, we will use a hardcoded admin credential.
// In a real production app, you'd fetch this from the database (User model).
// But since there is no User model logic yet, we start simple.

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    secret: process.env.AUTH_SECRET || 'fallback_secret_for_dev_only_12345',
    trustHost: true,
    callbacks: {
        async jwt({ token, user }) {
            console.log('JWT Callback:', { token, user });
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            console.log('Session Callback:', { session, token });
            if (session.user && token.role) {
                session.user.role = token.role as string;
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

                    // Admin Credential
                    if (username === 'Nimal' && password === 'Nimal@gm6814') {
                        return {
                            id: '1',
                            name: 'Admin User',
                            email: 'admin@gm.groups',
                            role: 'admin',
                        };
                    }

                    // Staff Credential
                    if (username === 'Staff' && password === 'Staff@gm123') {
                        return {
                            id: '2',
                            name: 'Staff Member',
                            email: 'staff@gm.groups',
                            role: 'staff',
                        };
                    }
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});
