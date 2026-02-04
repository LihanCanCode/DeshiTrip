"use client";

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Plane, MapPin, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function Home({ params }: { params: { locale: string } }) {
  const t = useTranslations('Index');

  return (
    <main className="min-h-screen bg-[#0a0f0d] text-white overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-900/20 rounded-full blur-[100px]" />

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
            href={`/${params.locale}/recommend`}
            className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-full font-medium transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)] inline-block text-white"
          >
            Explore
          </Link>
        </div>
      </nav>

      <section className="container mx-auto px-6 pt-20 pb-32 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight tracking-tighter">
            <span className="text-white">{t('title').substring(0, 5)}</span>
            <span className="text-emerald-500">Trip</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            {t('description')}
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Link
              href={`/${params.locale}/auth/register`}
              className="px-10 py-4 bg-emerald-600 rounded-2xl font-bold text-lg hover:bg-emerald-500 transition-all shadow-[0_0_40px_rgba(16,185,129,0.2)] hover:shadow-[0_0_60px_rgba(16,185,129,0.4)] text-white inline-block"
            >
              {t('getStarted')}
            </Link>
            <Link
              href={`/${params.locale}/recommend`}
              className="px-10 py-4 border border-zinc-700 rounded-2xl font-bold text-lg hover:bg-white/5 transition-all text-zinc-300 inline-block"
            >
              {t('exploreSpots')}
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: Plane, label: 'Trip Planning', color: 'text-blue-400' },
            { icon: MapPin, label: 'Local Spots', color: 'text-emerald-400' },
            { icon: Users, label: 'Group Tours', color: 'text-orange-400' },
            { icon: Wallet, label: 'Expense Tracking', color: 'text-purple-400' },
          ].map((feature, idx) => (
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
      </section>
    </main>
  );
}
