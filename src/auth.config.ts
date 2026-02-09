
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

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn && nextUrl.pathname === '/login') {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
        async redirect({ url, baseUrl }) {
            const allowedOrigins = [
                'https://gmgroups.site',
                'https://gmgroups.netlify.app',
                'http://localhost:3000',
                'http://localhost:3001'
            ];

            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`;

            // Allows callback URLs on the same origin
            if (new URL(url).origin === baseUrl) return url;

            // Allows callback URLs on allowed origins
            if (allowedOrigins.includes(new URL(url).origin)) return url;

            return baseUrl;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
