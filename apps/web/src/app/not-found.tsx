"use client";

import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex items-center justify-center min-h-screen text-white">
            <div className="text-center p-10 glass rounded-[2.5rem] border-white/5 bg-white/[0.02] backdrop-blur-2xl">
                <h1 className="text-6xl font-black mb-4 text-emerald-500">404</h1>
                <h2 className="text-2xl font-bold mb-6">Page Not Found</h2>
                <p className="text-zinc-500 mb-8 max-w-xs mx-auto">
                    The page you're looking for doesn't exist or has been moved to a new destination.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-emerald-500 hover:scale-105 active:scale-95"
                >
                    Back to Safety
                </Link>
            </div>
        </div>
    );
}
