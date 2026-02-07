"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import { Image as ImageIcon, MapPin, Send } from "lucide-react";
import api from "@/utils/api";

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPostCreated: () => void;
}

export const CreatePostModal = ({ isOpen, onClose, onPostCreated }: CreatePostModalProps) => {
    const [content, setContent] = useState("");
    const [spotName, setSpotName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!content || !spotName) return;

        setIsSubmitting(true);
        try {
            await api.post('/blogs', {
                content,
                spotName
            });

            onPostCreated();
            onClose();
            setContent("");
            setSpotName("");
        } catch (error) {
            console.error("Failed to create post", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Share Your Journey">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-400">Where did you go?</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                        <Input
                            value={spotName}
                            onChange={(e) => setSpotName(e.target.value)}
                            placeholder="e.g. Sajek Valley"
                            className="pl-10 bg-zinc-900 border-white/5"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-400">Tell us about it</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your experience..."
                        className="w-full h-32 bg-zinc-900 border border-white/5 rounded-2xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                    />
                </div>

                <div className="flex justify-between items-center pt-2">
                    <Button variant="ghost" className="text-zinc-400 hover:text-white">
                        <ImageIcon className="w-5 h-5 mr-2" />
                        Add Photos (Coming Soon)
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !content || !spotName}
                        className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl px-6"
                    >
                        {isSubmitting ? 'Posting...' : 'Post Journey'}
                        <Send className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
