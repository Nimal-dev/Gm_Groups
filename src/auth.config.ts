
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login', // Redirect to custom login page
    },
    trustHost: true,
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isClient = auth?.user?.role === 'client';

            if (isOnDashboard) {
                if (isLoggedIn && !isClient) return true;
                return false; // Redirect unauthenticated OR client users to login (or home)
            } else if (isLoggedIn) {
                if (nextUrl.pathname === '/login') {
                    // Redirect clients to catering request, staff to dashboard
                    if (isClient) return Response.redirect(new URL('/catering-request', nextUrl));
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }
            }
            return true;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
