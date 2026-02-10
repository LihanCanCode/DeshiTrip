import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from "@ducanh2912/next-pwa";

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const withPWA = withPWAInit({
    dest: "public",
    disable: process.env.NODE_ENV === "production",
    register: true,
    skipWaiting: true,
    fallbacks: {
        document: "/offline.html",
    },
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    compress: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default withNextIntl(withPWA(nextConfig));
