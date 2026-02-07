"use client";

import { useTranslations } from 'next-intl';
import { motion, LazyMotion, domAnimation } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/utils/api';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
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
        defaultValues: {
            rememberMe: false,
        }
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/login', data);
            const { token, user } = response.data;

            // Handle persistence based on Remember Me
            const storage = data.rememberMe ? localStorage : sessionStorage;
            storage.setItem('token', token);
            storage.setItem('user', JSON.stringify(user));

            router.push(`/${params.locale}/dashboard/groups`);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LazyMotion features={domAnimation}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </motion.div>
                )}

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

                <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                {...register('rememberMe')}
                            />
                            <div className="w-5 h-5 rounded-md border-2 border-white/10 bg-white/5 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all" />
                            <svg
                                className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 left-1 transition-opacity pointer-events-none"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="4"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">
                            {t('rememberMe')}
                        </span>
                    </label>
                    <Link href="#" className="text-xs text-emerald-500 hover:underline">{t('forgotPassword') || 'Forgot password?'}</Link>
                </div>

                <Button className="w-full group h-14 rounded-2xl" size="lg" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : t('login')}
                    {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </Button>
            </form>
        </LazyMotion>
    );
}
