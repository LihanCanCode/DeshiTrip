"use client";

import { useTranslations } from 'next-intl';
import { motion, LazyMotion, domAnimation } from 'framer-motion';
import { WifiOff, Home, Receipt, ArrowRight } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function OfflinePage() {
    const t = useTranslations('Offline');
    const params = useParams();
    const locale = params.locale as string;

    return (
        <LazyMotion features={domAnimation}>
            <main className="min-h-screen bg-[#0a0f0d] text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="absolute top-0 -left-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-900/10 rounded-full blur-[100px]" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 max-w-lg"
                >
                    <div className="mb-8 relative inline-block">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                        <div className="relative bg-zinc-900/50 border border-white/10 p-8 rounded-full shadow-2xl">
                            <WifiOff className="w-16 h-16 text-emerald-500 animate-pulse" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                        {t('title')}
                    </h1>

                    <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                        {t('description')}
                    </p>

                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl mb-12 backdrop-blur-xl">
                        <p className="text-sm font-medium text-emerald-400 mb-2 uppercase tracking-widest flex items-center justify-center gap-2">
                            <Receipt className="w-4 h-4" />
                            {t('savedData')}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href={`/${locale}/dashboard/expenses`} passHref>
                            <Button size="lg" className="rounded-2xl h-16 px-8 group w-full sm:w-auto">
                                {t('goExpenses')}
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>

                        <Link href={`/${locale}`} passHref>
                            <Button variant="outline" size="lg" className="rounded-2xl h-16 px-8 border-white/10 hover:bg-white/5 w-full sm:w-auto">
                                <Home className="mr-2 w-5 h-5 text-zinc-400" />
                                {t('goHome')}
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </main>
        </LazyMotion>
    );
}
