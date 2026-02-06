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
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/login', data);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            router.push(`/${params.locale}/recommend`);
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
        </LazyMotion>
    );
}
