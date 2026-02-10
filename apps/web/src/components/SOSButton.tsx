"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, ShieldAlert, Loader2 } from "lucide-react";
import api from "@/utils/api";
import { Button } from "./ui/Button";

export const SOSButton = () => {
    const [isConfirming, setIsConfirming] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [isTriggering, setIsTriggering] = useState(false);
    const [lastAlert, setLastAlert] = useState<any>(null);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isConfirming && countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (isConfirming && countdown === 0) {
            handleTriggerSOS();
        }
        return () => clearTimeout(timer);
    }, [isConfirming, countdown]);

    const handleTriggerSOS = async () => {
        setIsConfirming(false);
        setIsTriggering(true);
        try {
            // Get current location
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                });
            });

            const { longitude, latitude } = position.coords;

            const response = await api.post('/alerts/sos', {
                location: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                },
                message: "Emergency SOS triggered! Please help."
            });

            setLastAlert(response.data.alert);
            alert("SOS Alert Sent! Your group members have been notified.");
        } catch (error: any) {
            console.error("SOS Failed:", error);
            alert(error.message || "Failed to trigger SOS. Please check your location permissions.");
        } finally {
            setIsTriggering(false);
            setCountdown(3);
        }
    };

    const cancelSOS = () => {
        setIsConfirming(false);
        setCountdown(3);
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100]">
            <AnimatePresence>
                {isConfirming && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="absolute bottom-20 right-0 bg-red-600 p-6 rounded-[2.5rem] shadow-2xl shadow-red-500/40 border border-red-400/30 w-72"
                    >
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                <span className="text-3xl font-black text-white">{countdown}</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Emergency SOS</h3>
                                <p className="text-red-100 text-xs font-bold leading-tight mt-1 uppercase tracking-widest">Triggering in {countdown}s...</p>
                            </div>
                            <Button
                                onClick={cancelSOS}
                                variant="outline"
                                className="w-full bg-white text-red-600 border-none hover:bg-zinc-100 font-black rounded-2xl h-12 uppercase tracking-widest text-[10px]"
                            >
                                Cancel
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => !isConfirming && setIsConfirming(true)}
                disabled={isTriggering}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${isConfirming || isTriggering ? 'bg-zinc-900 border-4 border-red-600' : 'bg-red-600 shadow-red-600/40 hover:shadow-red-600/60'
                    }`}
            >
                {isTriggering ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : isConfirming ? (
                    <X className="w-8 h-8 text-white" />
                ) : (
                    <ShieldAlert className="w-8 h-8 md:w-10 md:h-10 text-white animate-pulse" />
                )}
            </motion.button>
        </div>
    );
};
