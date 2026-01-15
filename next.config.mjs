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
            'framer-motion',
            '@radix-ui/react-icons',
            '@radix-ui/react-avatar',
            '@radix-ui/react-dialog',
            // Add other large UI libraries here
        ],
    },
};

export default nextConfig;
