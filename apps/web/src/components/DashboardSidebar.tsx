"use client";

import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Map, Wallet, Settings, LogOut, Globe, WifiOff, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/utils/cn';
import { Logo } from './Logo';
import { useOnline } from '@/hooks/useOnline';
import { useState } from 'react';
import { Toast } from './ui/Toast';
import { LanguageSwitcher } from './LanguageSwitcher';

interface DashboardSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

export const DashboardSidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }: DashboardSidebarProps) => {
    const t = useTranslations('Sidebar');
    const pathname = usePathname();
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'en';
    const isOnline = useOnline();
    const [showToast, setShowToast] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: t('overview'), href: `/${locale}/dashboard`, offline: true },
        { icon: Users, label: t('myGroups'), href: `/${locale}/dashboard/groups`, offline: true },
        { icon: Map, label: t('exploreSpots'), href: `/${locale}/recommend` },
        { icon: Globe, label: t('community'), href: `/${locale}/community` },
        { icon: Wallet, label: t('expenses'), href: `/${locale}/dashboard/expenses`, offline: true },
        { icon: Sparkles, label: t('aiPlanner'), href: `/${locale}/dashboard/ai-planner` },
        { icon: Settings, label: t('settings'), href: `/${locale}/dashboard/profile` },
    ];

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        router.push(`/${params.locale}/auth/login`);
    };

    const handleLinkClick = (e: React.MouseEvent, item: typeof menuItems[0]) => {
        if (!isOnline && !item.offline) {
            e.preventDefault();
            setShowToast(true);
        } else if (onClose) {
            onClose();
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "fixed lg:relative inset-y-0 left-0 h-full bg-[#0a0f0d] border-r border-white/5 p-8 flex flex-col z-40 transition-all duration-300 transform lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full",
                isCollapsed ? "lg:w-24" : "w-80"
            )}>
                {/* Desktop Toggle Button */}
                <button
                    onClick={onToggleCollapse}
                    className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-emerald-600 hover:bg-emerald-500 rounded-full items-center justify-center text-white shadow-lg transition-colors z-50"
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </button>

                <Logo className={cn("mb-12 px-2 transition-opacity", isCollapsed && "lg:opacity-0 lg:hidden")} />

                <nav className="flex-1 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={(e) => handleLinkClick(e, item)}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative overflow-hidden",
                                    isActive
                                        ? "bg-emerald-600/10 text-emerald-500"
                                        : "text-zinc-500 hover:text-white hover:bg-white/5",
                                    (!isOnline && !item.offline) && "opacity-50 cursor-not-allowed grayscale",
                                    isCollapsed && "lg:justify-center"
                                )}
                                title={isCollapsed ? item.label : undefined}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-full"
                                    />
                                )}
                                <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "text-emerald-500")} />
                                <span className={cn("font-bold text-sm tracking-wide", isCollapsed && "lg:hidden")}>{item.label}</span>
                                {item.offline && !isCollapsed && (
                                    <div className="ml-auto opacity-40 group-hover:opacity-100 transition-opacity" title="Offline Ready">
                                        <WifiOff className="w-3.5 h-3.5" />
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className={cn(
                    "flex items-center justify-between mt-auto pt-6 border-t border-white/5",
                    isCollapsed && "lg:flex-col lg:gap-4"
                )}>
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-all group",
                            isCollapsed && "lg:w-full lg:justify-center"
                        )}
                        title={isCollapsed ? t('logout') : undefined}
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className={cn("font-bold text-sm tracking-wide", isCollapsed && "lg:hidden")}>{t('logout')}</span>
                    </button>
                    {!isCollapsed && <LanguageSwitcher />}
                </div>
            </aside>

            <Toast
                isVisible={showToast}
                onClose={() => setShowToast(false)}
                message="This feature requires an internet connection."
            />
        </>
    );
};
