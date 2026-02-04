"use client";

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/utils/api';

const registerSchema = z.z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const t = useTranslations('Auth');
    const router = useRouter();
    const params = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        setStatus(null);
        try {
            await api.post('/auth/register', data);
            setStatus({ type: 'success', message: 'Account created successfully! Redirecting to login...' });
            setTimeout(() => {
                router.push(`/${params.locale}/auth/login`);
            }, 2000);
        } catch (error: any) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Something went wrong. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass p-10 rounded-[2.5rem] border-white/5 bg-white/[0.02] backdrop-blur-2xl">
                    <div className="flex flex-col items-center mb-10 text-center">
                        <Logo className="mb-6" />
                        <h1 className="text-3xl font-black mb-2">{t('signUp')}</h1>
                        <p className="text-zinc-500">Plan your dream trip with friends.</p>
                    </div>

                    {status && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}
                        >
                            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                            <p className="text-sm font-medium">{status.message}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400 ml-1">{t('name')}</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                                <Input
                                    type="text"
                                    placeholder="John Doe"
                                    className={`pl-12 ${errors.name ? 'border-red-500' : ''}`}
                                    {...register('name')}
                                />
                            </div>
                            {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name.message}</p>}
                        </div>

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
                            <label className="text-sm font-medium text-zinc-400 ml-1">{t('password')}</label>
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
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                            {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </Button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-zinc-500 text-sm">
                            Already have an account?{' '}
                            <Link href="./login" className="text-emerald-500 font-bold hover:underline">
                                {t('login')}
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
