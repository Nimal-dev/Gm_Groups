
import type { NextAuthConfig } from 'next-auth';

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
            body,
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
        console.error('Error refreshing access token', error);
        return {
            ...token,
            error: 'RefreshAccessTokenError',
        };
    }
}

export const authConfig = {
    pages: {
        signIn: '/login', // Redirect to custom login page
    },
    trustHost: true,
    callbacks: {
        async jwt({ token, user, account, profile }) {
            // Initial Sign In
            if (account && user) {
                if (account.provider === 'credentials' || account.provider === 'vendor-mpin') {
                    return {
                        accessToken: 'mpin-auth',
                        refreshToken: null,
                        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 Days
                        user: {
                            ...user,
                            id: user.id,
                            name: user.name,
                            role: user.role,
                        }
                    };
                }

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

            if (token.accessToken === 'mpin-auth') {
                // MPIN sessions inherently don't use Discord OAuth refresh tokens
                return token;
            }

            // Access token has expired, try to update it
            return await refreshAccessToken(token);
        },
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
            // Pass accessToken to session for API use
            // @ts-ignore
            session.accessToken = token.accessToken;

            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnPortalDashboard = nextUrl.pathname.startsWith('/portal/dashboard');
            const isOnVendorDashboard = nextUrl.pathname.startsWith('/vendor-dashboard');
            const isApplicant = auth?.user?.role === 'applicant';
            const isVendor = auth?.user?.role?.startsWith('vendor_');

            // Vendor dashboard protection
            if (isOnVendorDashboard) {
                if (isLoggedIn && isVendor) return true;
                return Response.redirect(new URL('/vendor-login', nextUrl));
            }

            // Prevent vendors from accessing employee/admin dashboards
            if ((isOnDashboard || isOnPortalDashboard) && isVendor) {
                return Response.redirect(new URL('/vendor-dashboard', nextUrl));
            }

            if (isOnDashboard || isOnPortalDashboard) {
                if (isLoggedIn && !isApplicant) return true;
                return false; // Redirect unauthenticated users or applicants to login page
            } else if (isLoggedIn && nextUrl.pathname === '/vendor-login') {
                if (isVendor) return Response.redirect(new URL('/vendor-dashboard', nextUrl));
                // Non-vendors visiting vendor login — allow (they might need to switch)
            } else if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/portal/login')) {
                if (isVendor) return Response.redirect(new URL('/vendor-dashboard', nextUrl));
                if (isApplicant) return Response.redirect(new URL('/apply', nextUrl));
                if (nextUrl.pathname === '/portal/login') return Response.redirect(new URL('/portal/dashboard', nextUrl));
                return Response.redirect(new URL('/dashboard', nextUrl));
            } else if (isLoggedIn && isApplicant && !nextUrl.pathname.startsWith('/apply')) {
                // If they are logged in as an applicant, heavily bias them towards the /apply page
                // Only allow them on /apply or root /
                if (nextUrl.pathname !== '/') {
                    return Response.redirect(new URL('/apply', nextUrl));
                }
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
