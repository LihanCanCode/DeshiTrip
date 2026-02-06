"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#060a08] text-white overflow-hidden relative">
            <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 overflow-y-auto relative flex flex-col">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#060a08]/80 backdrop-blur-md sticky top-0 z-30">
                    <Logo />
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                    >
                        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </header>

                <div className="flex-1 p-4 md:p-8 relative">
                    {/* Subtle background gradient */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px] -z-10" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="h-full"
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
