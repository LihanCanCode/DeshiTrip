"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { Sparkles, Upload } from "lucide-react";
import api from "@/utils/api";
import { motion } from "framer-motion";

interface MemoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    onSuccess: () => void;
}

export const MemoryModal = ({ isOpen, onClose, groupId, onSuccess }: MemoryModalProps) => {
    const [note, setNote] = useState("");
    const [milestones, setMilestones] = useState("");
    const [foodieStat, setFoodieStat] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile || !groupId) return;

        setIsUploading(true);
        try {
            // 1. Upload Image to Cloudinary via Backend
            const formData = new FormData();
            formData.append('image', selectedFile);

            const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const imageUrl = uploadRes.data.url;

            // 2. Update Group with Memory
            await api.patch(`/groups/${groupId}/memory`, {
                coverImage: imageUrl,
                memoryNote: note,
                milestones: milestones,
                foodieStat: foodieStat
            });

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to save memory", error);
            alert("Failed to upload memory. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Capture Trip Memory">
            <div className="space-y-6">
                {/* Image Uploader */}
                <div className="group relative w-full h-64 bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-3xl overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />

                    {previewUrl ? (
                        <div className="relative w-full h-full">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white font-bold">Click to Change</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-6 space-y-2">
                            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                                <Upload className="w-6 h-6" />
                            </div>
                            <p className="text-zinc-400 font-bold">Click to upload cover photo</p>
                            <p className="text-zinc-600 text-xs">Supports JPG, PNG, WEBP</p>
                        </div>
                    )}
                </div>

                {/* Note */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">The Milestones</label>
                        <input
                            value={milestones}
                            onChange={(e) => setMilestones(e.target.value)}
                            placeholder="e.g. 3 Days | 5 Spots"
                            className="w-full h-14 bg-zinc-900 border border-white/5 rounded-2xl px-5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">The Foodie Stat</label>
                        <input
                            value={foodieStat}
                            onChange={(e) => setFoodieStat(e.target.value)}
                            placeholder="e.g. 8 Cups of Tea"
                            className="w-full h-14 bg-zinc-900 border border-white/5 rounded-2xl px-5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">A Travel Quote or Note</label>
                    <input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g. Best sunset ever! 🌅"
                        className="w-full h-14 bg-zinc-900 border border-white/5 rounded-2xl px-5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                </div>

                {/* Action */}
                <Button
                    onClick={handleSubmit}
                    disabled={!selectedFile || isUploading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-12 rounded-xl"
                >
                    {isUploading ? (
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            Uploading...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Save Memory
                        </span>
                    )}
                </Button>
            </div>
        </Modal>
    );
};
