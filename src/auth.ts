
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';

// For this initial implementation, we will use a hardcoded admin credential.
// In a real production app, you'd fetch this from the database (User model).
// But since there is no User model logic yet, we start simple.

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    secret: process.env.AUTH_SECRET,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ username: z.string(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { username, password } = parsedCredentials.data;

                    // Simple hardcoded check for now. 
                    // User can update this to DB logic later.
                    // TODO: Replace with DB call
                    if (username === 'Nimal' && password === 'Nimal@gm6814') {
                        return {
                            id: '1',
                            name: 'Admin User',
                            email: 'admin@gm.groups',
                        };
                    }
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});
