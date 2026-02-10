import Image from "next/image";
import { cn } from "@/utils/cn";
import { useTranslations } from 'next-intl';

interface LogoProps {
    className?: string;
    showText?: boolean;
}

export const Logo = ({ className, showText = true }: LogoProps) => {
    const t = useTranslations('Logo');
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-40 animate-pulse" />
                <Image
                    src="/icons/logo.png"
                    alt="DesiTrip Logo"
                    width={32}
                    height={32}
                    className="relative w-8 h-8 object-contain rounded-lg shadow-lg"
                />
            </div>
            {showText && (
                <span className="text-xl font-bold tracking-tight">
                    {t('deshi')}<span className="text-emerald-500">{t('trip')}</span>
                </span>
            )}
        </div>
    );
};
