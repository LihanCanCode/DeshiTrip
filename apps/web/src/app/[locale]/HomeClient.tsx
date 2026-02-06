"use client";

import { motion, LazyMotion, domAnimation } from 'framer-motion';
import { Plane, MapPin, Users, Wallet } from 'lucide-react';
import { Logo } from '@/components/Logo';
import Link from 'next/link';

export function HomeNav({ locale }: { locale: string }) {
    return (
        <nav className="container mx-auto px-6 py-8 flex justify-between items-center relative z-10">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <Logo />
            </motion.div>
            <div className="flex gap-8 items-center">
                <Link href="/en" className="hover:text-emerald-400 transition-colors">EN</Link>
                <Link href="/bn" className="hover:text-emerald-400 transition-colors">বাংলা</Link>
                <Link
                    href={`/${locale}/recommend`}
                    className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-full font-medium transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)] inline-block text-white"
                >
                    Explore
                </Link>
            </div>
        </nav>
    );
}

export function FeatureCards() {
    const features = [
        { icon: Plane, label: 'Trip Planning', color: 'text-blue-400' },
        { icon: MapPin, label: 'Local Spots', color: 'text-emerald-400' },
        { icon: Users, label: 'Group Tours', color: 'text-orange-400' },
        { icon: Wallet, label: 'Expense Tracking', color: 'text-purple-400' },
    ];

    return (
        <LazyMotion features={domAnimation}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {features.map((feature, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        viewport={{ once: true }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] hover:border-emerald-500/50 transition-all group"
                    >
                        <feature.icon className={`w-12 h-12 mb-6 ${feature.color} group-hover:scale-110 transition-transform`} />
                        <h3 className="text-xl font-bold mb-2">{feature.label}</h3>
                        <p className="text-zinc-500">The most intuitive way to manage your travel experience.</p>
                    </motion.div>
                ))}
            </div>
        </LazyMotion>
    );
}
