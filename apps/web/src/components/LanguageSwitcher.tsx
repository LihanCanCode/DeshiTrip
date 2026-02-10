"use client";

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export const LanguageSwitcher = () => {
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();

    const toggleLanguage = () => {
        const nextLocale = locale === 'en' ? 'bn' : 'en';

        // pathname looks like "/en/dashboard" or "/bn/dashboard"
        // We want to replace the first segment
        const segments = pathname.split('/');
        segments[1] = nextLocale;

        const nextPath = segments.join('/') || `/${nextLocale}`;
        router.push(nextPath);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
            title={locale === 'en' ? 'বাংলায় দেখুন' : 'View in English'}
        >
            <motion.span
                initial={false}
                animate={{ scale: locale === 'en' ? 1.1 : 1 }}
                className={`text-xs font-bold ${locale === 'en' ? 'text-emerald-400' : 'text-zinc-500'}`}
            >
                EN
            </motion.span>
            <div className="w-px h-3 bg-white/10" />
            <motion.span
                initial={false}
                animate={{ scale: locale === 'bn' ? 1.1 : 1 }}
                className={`text-xs font-bold ${locale === 'bn' ? 'text-emerald-400' : 'text-zinc-500'}`}
            >
                বাং
            </motion.span>
        </button>
    );
};
