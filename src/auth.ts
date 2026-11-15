import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import connectToDatabase from '@/lib/db';
import Employee from '@/models/Employee';
import VendorUser from '@/models/VendorUser';
import { escapeRegex } from '@/lib/employee-utils';

/**
 * NextAuth Configuration
 * 
 * Handles authentication via Discord OAuth and MPIN Credentials.
 * - Verifies user existence in the internal `Employee` database.
 * - Assigns roles (Admin, Bulkhead, Staff) based on Employee Rank.
 * - Asynchronously logs login activity to the central bot logging system without blocking user redirect.
 * - Persists Employee Name and Role in the session.
 */
export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    useSecureCookies: process.env.NODE_ENV === 'production',
    cookies: {
        sessionToken: {
            name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}authjs.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production'
            }
        },
        callbackUrl: {
            name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}authjs.callback-url`,
            options: {
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production'
            }
        },
        csrfToken: {
            name: `${process.env.NODE_ENV === 'production' ? '__Host-' : ''}authjs.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production'
            }
        }
    },
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // 7 Days
    },
    callbacks: {
        ...authConfig.callbacks,
        /**
         * SignIn Callback
         * Validates the Discord user against the Employee database.
         */
        async signIn({ user, account, profile }) {
            if (account?.provider === 'discord' && profile) {
                try {
                    await connectToDatabase();
                    // Fast indexed lookup for Discord User ID in Employee collection
                    const employee = await Employee.findOne({ userId: profile.id, status: 'Active' }).lean();

                    if (!employee) {
                        console.info(`New applicant login: ${profile.username} (${profile.id}). They are not an active employee.`);
                        user.role = 'applicant';
                        user.name = (profile.username as string) || (profile.name as string) || 'Applicant';
                        return true; // Allow them in but uniquely identified as applicant
                    }

                    // Map Rank to Website Role
                    const rank = (employee.rank || '').toLowerCase();
                    let role = 'staff'; // Default role (Covering Staff, Recruit, Novice, etc.)

                    if (rank.includes('owner') || rank.includes('boss') || rank.includes('management') || rank.includes('manager') || rank.includes('lawyer')) {
                        role = 'admin';
                    } else if (rank.includes('head') || rank.includes('bulk') || rank.includes('lead')) {
                        role = 'bulkhead';
                    }

                    // Attach the determined role and name to the user object so it passes to the JWT/Session
                    user.role = role;
                    user.name = employee.username; // Use DB Employee Name instead of Discord Username

                    // Fire-and-forget: Log the login activity in the background without blocking the user response
                    import('@/lib/bot-api').then(({ fetchBot }) => {
                        fetchBot('/api/website-log', {
                            method: 'POST',
                            body: JSON.stringify({
                                action: 'Login',
                                user: employee.username,
                                details: `User ${employee.username} logged in via Discord.`,
                                role: role
                            })
                        }).catch(err => console.error('Failed to log Discord login:', err));
                    }).catch(err => console.error('Failed to load bot-api for website-log:', err));

                    return true;
                } catch (error) {
                    console.error('Error during Discord sign-in verification:', error);
                    return false;
                }
            }
            if (account?.provider === 'credentials' || account?.provider === 'vendor-mpin') {
                return true;
            }
            return false; // Deny other unsupported login attempts
        },
    },
    providers: [
        Discord({
            clientId: process.env.AUTH_DISCORD_ID,
            clientSecret: process.env.AUTH_DISCORD_SECRET,
            authorization: { params: { scope: 'identify email guilds guilds.join' } },
        }),
        Credentials({
            name: 'MPIN Login',
            credentials: {
                loginId: { label: "Login ID", type: "text" },
                mpin: { label: "MPIN", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.loginId || !credentials?.mpin) {
                    throw new Error('Missing credentials');
                }

                await connectToDatabase();
                const loginInput = String(credentials.loginId).trim();
                const mpinInput = String(credentials.mpin).trim();

                // 1. Fast indexed exact lookup (matches Login ID, Username, or Nickname)
                let employee = await Employee.findOne({
                    $or: [
                        { loginId: loginInput },
                        { loginId: loginInput.toLowerCase() },
                        { username: loginInput },
                        { nickname: loginInput }
                    ],
                    status: 'Active'
                }).select('userId username rank status loginId mpin nickname').lean();

                // 2. Case-insensitive exact match
                if (!employee) {
                    const safeRegex = new RegExp('^' + escapeRegex(loginInput) + '$', 'i');
                    employee = await Employee.findOne({
                        $or: [
                            { loginId: safeRegex },
                            { username: safeRegex },
                            { nickname: safeRegex }
                        ],
                        status: 'Active'
                    }).select('userId username rank status loginId mpin nickname').lean();
                }

                // 3. Match without or with "GM | " prefix if user entered just their name (e.g., "Arya Krishnan" or "Nimal Prince")
                if (!employee && !loginInput.toUpperCase().startsWith('GM | ')) {
                    const prefixedRegex = new RegExp('^GM\\s*\\|\\s*' + escapeRegex(loginInput) + '$', 'i');
                    employee = await Employee.findOne({
                        username: prefixedRegex,
                        status: 'Active'
                    }).select('userId username rank status loginId mpin nickname').lean();
                }

                if (!employee) {
                    console.warn(`[Auth] No active employee found for: ${loginInput}`);
                    throw new Error('Invalid Login ID or MPIN');
                }

                if (employee.mpin !== mpinInput) {
                    console.warn(`[Auth] MPIN mismatch for: ${loginInput}`);
                    throw new Error('Invalid Login ID or MPIN');
                }

                // Map Rank to Website Role
                const rank = (employee.rank || '').toLowerCase();
                let role = 'staff';

                if (rank.includes('owner') || rank.includes('boss') || rank.includes('management') || rank.includes('manager') || rank.includes('lawyer')) {
                    role = 'admin';
                } else if (rank.includes('head') || rank.includes('bulk') || rank.includes('lead')) {
                    role = 'bulkhead';
                }

                return {
                    id: employee.userId, // Use original discord user ID mapping
                    name: employee.username,
                    role: role,
                } as any;
            }
        }),
        Credentials({
            id: 'vendor-mpin',
            name: 'Vendor MPIN Login',
            credentials: {
                vendorId: { label: "Vendor ID", type: "text" },
                mpin: { label: "MPIN", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.vendorId || !credentials?.mpin) {
                    throw new Error('Missing credentials');
                }

                await connectToDatabase();
                const vendorIdStr = String(credentials.vendorId).trim();
                const mpinInput = String(credentials.mpin).trim();

                // Fast indexed exact lookup first
                let vendor = await VendorUser.findOne({
                    $or: [
                        { vendorId: vendorIdStr },
                        { vendorId: vendorIdStr.toLowerCase() },
                        { name: vendorIdStr }
                    ]
                }).select('_id name role vendorId mpin').lean();

                if (!vendor) {
                    // Fallback to case-insensitive regex
                    const safeRegex = new RegExp('^' + escapeRegex(vendorIdStr) + '$', 'i');
                    vendor = await VendorUser.findOne({
                        $or: [
                            { vendorId: safeRegex },
                            { name: safeRegex }
                        ]
                    }).select('_id name role vendorId mpin').lean();
                }

                if (!vendor) {
                    console.warn(`[Auth] No vendor found for Vendor ID: ${vendorIdStr}`);
                    throw new Error('Invalid Vendor ID or MPIN');
                }

                if (vendor.mpin !== mpinInput) {
                    console.warn(`[Auth] MPIN mismatch for Vendor ID: ${vendorIdStr}`);
                    throw new Error('Invalid Vendor ID or MPIN');
                }

                const role = `vendor_${vendor.role.toLowerCase()}`; // vendor_mlb or vendor_ykz

                return {
                    id: vendor._id.toString(),
                    name: vendor.name,
                    role: role,
                    vendorId: vendor.vendorId,
                } as any;
            }
        })
    ],
});
