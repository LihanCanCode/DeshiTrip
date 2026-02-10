"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, MapPin, X, ExternalLink, ShieldAlert } from "lucide-react";
import socket from "@/utils/socket";
import { Button } from "./ui/Button";

interface IncomingAlert {
    alertId: string;
    user: {
        id: string;
        _id?: string;
        name: string;
        email: string;
    };
    location: {
        coordinates: [number, number];
    };
    message: string;
    timestamp: string;
}

export const SOSAlertOverlay = () => {
    const [activeAlert, setActiveAlert] = useState<IncomingAlert | null>(null);

    useEffect(() => {
        // Connect socket if not already
        if (!socket.connected) {
            socket.connect();
        }

        const handleSOS = (data: IncomingAlert) => {
            console.log("RECEIVED SOS ALERT:", data);

            // Filter out own alerts
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const currentUser = JSON.parse(storedUser);
                const senderId = data.user.id || data.user._id;
                if (currentUser.id === senderId) {
                    console.log("Ignoring own SOS alert");
                    return;
                }
            }

            setActiveAlert(data);
            // Play a sound if possible (audio context might be blocked initially)
            const audio = new Audio('/emergency-alert.mp3');
            audio.play().catch(e => console.log("Audio play blocked"));
        };

        const handleResolve = (data: { alertId: string }) => {
            if (activeAlert?.alertId === data.alertId) {
                setActiveAlert(null);
            }
        };

        socket.on('sos_alert', handleSOS);
        socket.on('sos_resolved', handleResolve);

        return () => {
            socket.off('sos_alert', handleSOS);
            socket.off('sos_resolved', handleResolve);
        };
    }, [activeAlert]);

    if (!activeAlert) return null;

    const googleMapsUrl = `https://www.google.com/maps?q=${activeAlert.location.coordinates[1]},${activeAlert.location.coordinates[0]}`;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 50 }}
                    className="w-full max-w-lg bg-zinc-950 border-4 border-red-600 rounded-[3rem] shadow-[0_0_100px_rgba(220,38,38,0.5)] overflow-hidden pointer-events-auto"
                >
                    <div className="bg-red-600 p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-3 rounded-2xl">
                                <AlertTriangle className="w-8 h-8 text-red-600 animate-bounce" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Emergency SOS</h2>
                                <p className="text-red-100 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Life Safety Alert</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveAlert(null)}
                            className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-red-600/20 rounded-[1.5rem] flex items-center justify-center font-black text-2xl text-red-500">
                                {activeAlert.user.name[0]}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">{activeAlert.user.name}</h3>
                                <p className="text-zinc-500 text-sm font-medium">{activeAlert.user.email}</p>
                            </div>
                        </div>

                        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                            <p className="text-zinc-300 italic text-lg font-medium leading-relaxed">
                                "{activeAlert.message}"
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <a
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-white hover:bg-zinc-100 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-white/5 uppercase tracking-widest text-xs"
                            >
                                <MapPin className="w-5 h-5 text-red-600" />
                                Open on Google Maps
                            </a>
                            <Button
                                onClick={() => setActiveAlert(null)}
                                variant="outline"
                                className="w-full border-white/10 hover:bg-white/5 text-zinc-500 font-bold py-4 rounded-2xl uppercase tracking-widest text-[10px]"
                            >
                                Dismiss for now
                            </Button>
                        </div>
                    </div>

                    <div className="bg-red-600/10 p-4 border-t border-red-600/20 flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                        <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">Broadcast Live to your Group</span>
                    </div>
                </motion.div>
            </div>

            {/* Pulsing full screen background to get attention */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-red-600 z-[999] pointer-events-none animate-pulse"
            />
        </AnimatePresence>
    );
};
