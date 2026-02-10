"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import axios from "axios";

interface Comment {
    user: { _id: string; name: string; avatar?: string };
    text: string;
    createdAt: string;
}

interface Blog {
    _id: string;
    author: { _id: string; name: string; avatar?: string };
    content: string;
    spotName: string;
    likes: string[];
    comments: Comment[];
    createdAt: string;
}

interface BlogCardProps {
    blog: Blog;
    currentUserId?: string;
}

export const BlogCard = ({ blog, currentUserId }: BlogCardProps) => {
    const [likes, setLikes] = useState(blog.likes);
    const [comments, setComments] = useState(blog.comments);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [isLiked, setIsLiked] = useState(currentUserId ? blog.likes.includes(currentUserId) : false);

    const handleLike = async () => {
        if (!currentUserId) return; // Prevent if not logged in

        try {
            const token = localStorage.getItem('token');
            // Optimistic Update
            if (isLiked) {
                setLikes(prev => prev.filter(id => id !== currentUserId));
                setIsLiked(false);
            } else {
                setLikes(prev => [...prev, currentUserId]);
                setIsLiked(true);
            }

            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${blog._id}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Like failed", error);
            // Revert if failed (omitted for brevity)
        }
    };

    const handleComment = async () => {
        if (!process.env.NEXT_PUBLIC_API_URL) return;
        if (!newComment.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${blog._id}/comment`, {
                text: newComment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setComments(res.data.comments);
            setNewComment("");
        } catch (error) {
            console.error("Comment failed", error);
        }
    };

    return (
        <div className="glass border border-white/5 rounded-[2rem] p-6 mb-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white uppercase overflow-hidden">
                        {blog.author.avatar ? (
                            <img src={blog.author.avatar} alt={blog.author.name} className="w-full h-full object-cover" />
                        ) : (
                            blog.author.name[0]
                        )}
                    </div>
                    <div>
                        <h4 className="font-bold text-white">{blog.author.name}</h4>
                        <p className="text-xs text-zinc-500">{formatDistanceToNow(new Date(blog.createdAt))} ago</p>
                    </div>
                </div>
                <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {blog.spotName}
                </div>
            </div>

            {/* Content */}
            <p className="text-zinc-300 leading-relaxed mb-6 whitespace-pre-wrap">
                {blog.content}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-6 border-t border-white/5 pt-4">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 text-sm font-bold transition-colors ${isLiked ? 'text-red-500' : 'text-zinc-400 hover:text-white'
                        }`}
                >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    {likes.length}
                </button>
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors"
                >
                    <MessageCircle className="w-5 h-5" />
                    {comments.length}
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                    {comments.map((comment, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 flex-shrink-0 overflow-hidden">
                                {comment.user?.avatar ? (
                                    <img src={comment.user.avatar} alt={comment.user.name} className="w-full h-full object-cover" />
                                ) : (
                                    comment.user?.name?.[0] || 'U'
                                )}
                            </div>
                            <div className="bg-zinc-800/50 rounded-2xl p-3 flex-1">
                                <p className="text-xs font-bold text-zinc-400 mb-1">{comment.user?.name || 'User'}</p>
                                <p className="text-sm text-zinc-300">{comment.text}</p>
                            </div>
                        </div>
                    ))}

                    <div className="flex gap-2">
                        <input
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 bg-zinc-900 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                        <Button onClick={handleComment} size="icon" className="bg-emerald-500 rounded-xl w-10 h-10">
                            <Send className="w-4 h-4 text-black" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
