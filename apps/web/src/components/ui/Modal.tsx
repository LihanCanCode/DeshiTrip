"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] cursor-pointer"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-[101] p-4 md:p-6 pointer-events-none focus:outline-none"
                    >
                        <div className="w-full max-w-xl pointer-events-auto">
                            <div className="glass bg-[#0d1310] border-white/10 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl relative max-h-[95vh] md:max-h-[90vh] flex flex-col">
                                {/* Header */}
                                <div className="flex items-center justify-between p-5 md:p-8 border-b border-white/5 flex-shrink-0">
                                    <h3 className="text-lg md:text-2xl font-black">{title}</h3>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5 md:w-6 md:h-6" />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="p-5 md:p-8 overflow-y-auto custom-scrollbar">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
