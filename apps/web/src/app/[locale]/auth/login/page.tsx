import { useTranslations } from 'next-intl';
import { Logo } from '@/components/Logo';
import Link from 'next/link';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
    const t = useTranslations('Auth');

    return (
        <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px]" />

            <div className="w-full max-w-md relative z-10">
                <div className="glass p-10 rounded-[2.5rem] border-white/5 bg-white/[0.02] backdrop-blur-2xl">
                    <div className="flex flex-col items-center mb-10 text-center">
                        <Logo className="mb-6" />
                        <h1 className="text-3xl font-black mb-2">{t('login')}</h1>
                        <p className="text-zinc-500">Welcome back to your next adventure.</p>
                    </div>

                    <LoginForm />

                    <div className="mt-10 text-center">
                        <p className="text-zinc-500 text-sm">
                            Don&apos;t have an account?{' '}
                            <Link href="./register" className="text-emerald-500 font-bold hover:underline">
                                {t('signUp')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
