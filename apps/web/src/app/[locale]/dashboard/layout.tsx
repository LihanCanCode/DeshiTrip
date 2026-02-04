"use client";

import { DashboardSidebar } from "@/components/DashboardSidebar";
import { motion } from "framer-motion";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-[#060a08] text-white overflow-hidden">
            <DashboardSidebar />
            <main className="flex-1 overflow-y-auto relative p-8">
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
            </main>
        </div>
    );
}
