import React from 'react';
import { cn } from "@/utils/cn";


export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
        const variants = {
            primary: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]',
            secondary: 'bg-zinc-800 text-white hover:bg-zinc-700',
            outline: 'border border-zinc-700 text-zinc-300 hover:bg-white/5',
            ghost: 'text-zinc-400 hover:text-white hover:bg-white/5',
        };

        const sizes = {
            sm: 'h-9 px-4 text-xs',
            md: 'h-12 px-8 text-sm',
            lg: 'h-14 px-10 text-base',
            icon: 'h-10 w-10 p-0',
        };

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                disabled={isLoading}
                {...props}
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    children
                )}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };
