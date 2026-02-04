"use client";

import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Map, Wallet, Settings, LogOut, Globe } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { Logo } from './Logo';

export const DashboardSidebar = () => {
    const pathname = usePathname();
    const params = useParams();
    const locale = params.locale as string;

    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', href: `/${locale}/dashboard` },
        { icon: Users, label: 'My Groups', href: `/${locale}/dashboard/groups` },
        { icon: Map, label: 'Explore Spots', href: `/${locale}/recommend` },
        { icon: Globe, label: 'Community', href: `/${locale}/community` },
        { icon: Wallet, label: 'Expenses', href: `/${locale}/dashboard/expenses` },
        { icon: Settings, label: 'Settings', href: `/${locale}/dashboard/profile` },
    ];

    return (
        <aside className="w-80 h-full bg-[#0a0f0d] border-r border-white/5 p-8 flex flex-col relative z-20">
            <Logo className="mb-12 px-2" />

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative overflow-hidden",
                                isActive
                                    ? "bg-emerald-600/10 text-emerald-500"
                                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-nav"
                                    className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-full"
                                />
                            )}
                            <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "text-emerald-500")} />
                            <span className="font-bold text-sm tracking-wide">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <button className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-all group mt-auto">
                <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold text-sm tracking-wide">Logout</span>
            </button>
        </aside>
    );
};
