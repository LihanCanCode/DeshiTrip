import { Plane } from "lucide-react";
import { cn } from "@/utils/cn";

interface LogoProps {
    className?: string;
    showText?: boolean;
}

export const Logo = ({ className, showText = true }: LogoProps) => {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-40 animate-pulse" />
                <div className="relative bg-emerald-600 p-2 rounded-xl">
                    <Plane className="w-6 h-6 text-white transform -rotate-12" />
                </div>
            </div>
            {showText && (
                <span className="text-xl font-bold tracking-tight">
                    Deshi<span className="text-emerald-500">Trip</span>
                </span>
            )}
        </div>
    );
};
