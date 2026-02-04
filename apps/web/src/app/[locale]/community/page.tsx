"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Search, PenLine, Filter } from "lucide-react";
import DashboardLayout from "../dashboard/layout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BlogCard } from "@/components/blog/BlogCard";
import { CreatePostModal } from "@/components/blog/CreatePostModal";
import { useTranslations } from "next-intl";

export default function CommunityPage() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [filterSpot, setFilterSpot] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

    const fetchBlogs = async () => {
        setIsLoading(true);
        try {
            const url = filterSpot
                ? `${process.env.NEXT_PUBLIC_API_URL}/blogs?spot=${filterSpot}`
                : `${process.env.NEXT_PUBLIC_API_URL}/blogs`;

            const res = await axios.get(url);
            setBlogs(res.data);
        } catch (error) {
            console.error("Failed to fetch blogs", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial load & Filter effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchBlogs();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [filterSpot]);

    // Get current user ID from token (simple decode)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const decoded = JSON.parse(jsonPayload);
                setCurrentUserId(decoded.id || decoded.userId);
            } catch (e) {
                console.error("Token decode error", e);
            }
        }
    }, []);

    return (
        <DashboardLayout>
            <CreatePostModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onPostCreated={fetchBlogs}
            />

            <div className="flex flex-col h-full gap-8 max-w-5xl mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <h1 className="text-4xl font-black mb-2">Community Stories</h1>
                        <p className="text-zinc-400">Read experiences from fellow travelers or share your own.</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <Input
                                placeholder="Filter by spot (e.g. Sajek)..."
                                className="pl-10 h-12 bg-zinc-900/50 border-emerald-500/20 focus:border-emerald-500"
                                value={filterSpot}
                                onChange={(e) => setFilterSpot(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-12 px-6 rounded-xl whitespace-nowrap"
                        >
                            <PenLine className="w-4 h-4 mr-2" />
                            Share Journey
                        </Button>
                    </div>
                </div>

                {/* Feed Section */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 rounded-[2rem] bg-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : blogs.length > 0 ? (
                        blogs.map((blog) => (
                            <BlogCard
                                key={blog._id}
                                blog={blog}
                                currentUserId={currentUserId}
                            />
                        ))
                    ) : (
                        <div className="text-center py-20 text-zinc-500">
                            <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No stories found regarding "{filterSpot}".</p>
                            <p className="text-sm">Be the first to write about it!</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
