"use client";

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/utils/api';

const loginSchema = z.z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const t = useTranslations('Auth');
    const router = useRouter();
    const params = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/login', data);
            const { token } = response.data;
            localStorage.setItem('token', token);
            router.push(`/${params.locale}/recommend`);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass p-10 rounded-[2.5rem] border-white/5 bg-white/[0.02] backdrop-blur-2xl">
                    <div className="flex flex-col items-center mb-10 text-center">
                        <Logo className="mb-6" />
                        <h1 className="text-3xl font-black mb-2">{t('login')}</h1>
                        <p className="text-zinc-500">Welcome back to your next adventure.</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500"
                        >
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400 ml-1">{t('email')}</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    className={`pl-12 ${errors.email ? 'border-red-500' : ''}`}
                                    {...register('email')}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-medium text-zinc-400">{t('password')}</label>
                                <Link href="#" className="text-xs text-emerald-500 hover:underline">Forgot password?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className={`pl-12 ${errors.password ? 'border-red-500' : ''}`}
                                    {...register('password')}
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password.message}</p>}
                        </div>

                        <Button className="w-full group" size="lg" disabled={isLoading}>
                            {isLoading ? 'Logging in...' : t('login')}
                            {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </Button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-zinc-500 text-sm">
                            Don&apos;t have an account?{' '}
                            <Link href="./register" className="text-emerald-500 font-bold hover:underline">
                                {t('signUp')}
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
