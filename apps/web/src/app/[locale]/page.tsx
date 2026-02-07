import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { HomeNav, FeatureCards } from './HomeClient';
import { AuthRedirect } from '@/components/auth/AuthRedirect';

export default function Home({ params }: { params: { locale: string } }) {
  const t = useTranslations('Index');

  return (
    <main className="min-h-screen bg-[#0a0f0d] text-white overflow-hidden relative">
      <AuthRedirect />
      {/* Background Glows */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-900/20 rounded-full blur-[100px]" />

      <HomeNav locale={params.locale} />

      <section className="container mx-auto px-6 pt-20 pb-32 text-center relative z-10">
        <div className="transition-all duration-1000">
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight tracking-tighter">
            <span className="text-white">{params.locale === 'en' ? 'Deshi' : 'দেশি'}</span>
            <span className="text-emerald-500">{params.locale === 'en' ? 'Trip' : 'ট্রিপ'}</span>
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
        </div>
      </section>

      <section className="container mx-auto px-6 py-20 relative z-10">
        <FeatureCards />
      </section>
    </main>
  );
}
