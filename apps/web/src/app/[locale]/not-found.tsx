"use client";

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { MapPinOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
    const t = useTranslations('Auth'); // Reusing some auth translations for simplicity or we could add 'Error'

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="glass p-12 rounded-[3rem] border-white/5 bg-white/[0.02] backdrop-blur-2xl relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/20 rounded-full blur-[80px] -z-10" />

                    <div className="mb-8 flex justify-center">
                        <div className="p-6 bg-emerald-500/10 rounded-3xl text-emerald-500">
                            <MapPinOff className="w-12 h-12" />
                        </div>
                    </div>

                    <h1 className="text-5xl font-black mb-4">Lost Your Way?</h1>
                    <p className="text-zinc-500 mb-10 leading-relaxed">
                        Even the best explorers get lost sometimes. We couldn't find the spot you were looking for.
                    </p>

                    <Link href="/">
                        <Button className="w-full h-16 rounded-2xl group" size="lg">
                            <ArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            Go Back Home
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
