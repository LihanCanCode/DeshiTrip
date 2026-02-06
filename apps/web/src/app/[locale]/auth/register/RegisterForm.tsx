"use client";

import { useTranslations } from 'next-intl';
import { motion, LazyMotion, domAnimation } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/utils/api';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
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
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            setStatus({
                type: 'error',
                message: err.response?.data?.message || 'Something went wrong. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LazyMotion features={domAnimation}>
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
        </LazyMotion>
    );
}
