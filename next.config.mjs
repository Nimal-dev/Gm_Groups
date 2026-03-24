/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    compress: true,
    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**', // Update this based on where images are hosted (e.g., imgur, discord, etc.)
            },
        ],
    },
    experimental: {
        optimizePackageImports: [
            'lucide-react',
            'recharts',
            '@radix-ui/react-icons',
            '@radix-ui/react-avatar',
            '@radix-ui/react-dialog',
            // framer-motion intentionally excluded — causes MIME-type errors on Netlify
            // with Next.js 15 chunk splitting (chunks served as text/plain instead of JS)
        ],
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()'
                    }
                ]
            }
        ];
    }
};

export default nextConfig;
