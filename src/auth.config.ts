
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login', // Redirect to custom login page
    },
    trustHost: true,
    callbacks: {
        async session({ session, token }) {
            if (session.user && token) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
                session.user.name = token.name;
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            // Treat undefined role as client (safe default)
            const isClient = auth?.user?.role === 'client' || !auth?.user?.role;



            if (isOnDashboard) {
                // strict check: only allow known staff roles
                const allowedRoles = ['admin', 'staff', 'bulkhead'];
                const hasAccess = auth?.user?.role && allowedRoles.includes(auth.user.role);

                if (isLoggedIn && hasAccess) return true;
                return false; // Redirect unauthenticated OR unauthorized users
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
