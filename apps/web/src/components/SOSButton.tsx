"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, ShieldAlert, Loader2 } from "lucide-react";
import api from "@/utils/api";
import { Button } from "./ui/Button";

export const SOSButton = () => {
    const [isHolding, setIsHolding] = useState(false);
    const [holdProgress, setHoldProgress] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(10);
    const [isTriggering, setIsTriggering] = useState(false);
    const [lastAlert, setLastAlert] = useState<any>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isHolding && !isRecording && !isTriggering) {
            interval = setInterval(() => {
                setHoldProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        startRecording();
                        return 100;
                    }
                    return prev + (100 / (3000 / 100)); // Update every 100ms
                });
            }, 100);
        } else {
            setHoldProgress(0);
        }
        return () => clearInterval(interval);
    }, [isHolding, isRecording, isTriggering]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isRecording && recordingTime > 0) {
            timer = setTimeout(() => setRecordingTime(recordingTime - 1), 1000);
        } else if (isRecording && recordingTime === 0) {
            handleTriggerSOS();
        }
        return () => clearTimeout(timer);
    }, [isRecording, recordingTime]);

    const startRecording = async () => {
        setIsHolding(false);
        setIsRecording(true);
        setRecordingTime(10);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = () => {
                setAudioChunks(chunks);
            };

            recorder.start();
            setMediaRecorder(recorder);
        } catch (err) {
            console.error("Microphone access denied:", err);
            setIsRecording(false);
            alert("Microphone access is required for SOS voice message.");
        }
    };

    const handleTriggerSOS = async () => {
        setIsRecording(false);
        setIsTriggering(true);

        let voiceBase64 = "";

        // Stop recording and get base64
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            const audioPromise = new Promise<string>((resolve) => {
                mediaRecorder.onstop = () => {
                    // Collect all chunks accumulated so far
                    const blob = new Blob(audioChunks, { type: 'audio/webm' });
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result as string);
                    };
                    reader.readAsDataURL(blob);
                };
                mediaRecorder.stop();
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
            });
            voiceBase64 = await audioPromise;
        }

        try {
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
                message: "Emergency SOS triggered! Please help.",
                voiceData: voiceBase64
            });

            setLastAlert(response.data.alert);
            alert("SOS Alert Sent! Your group members have been notified.");
        } catch (error: any) {
            console.error("SOS Failed:", error);
            alert(error.message || "Failed to trigger SOS.");
        } finally {
            setIsTriggering(false);
            setRecordingTime(10);
            setMediaRecorder(null);
            setAudioChunks([]);
        }
    };

    const cancelSOS = () => {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        setIsRecording(false);
        setIsHolding(false);
        setHoldProgress(0);
        setRecordingTime(10);
        setMediaRecorder(null);
        setAudioChunks([]);
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100]">
            <AnimatePresence>
                {(isHolding || isRecording) && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="absolute bottom-24 right-0 bg-zinc-950 p-6 rounded-[2.5rem] shadow-2xl border-2 border-red-600 w-80 overflow-hidden"
                    >
                        {/* Progress Bar for Hold */}
                        {isHolding && !isRecording && (
                            <div className="absolute top-0 left-0 h-1 bg-red-600 transition-all duration-100" style={{ width: `${holdProgress}%` }} />
                        )}

                        <div className="text-center space-y-4">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-white/10'}`}>
                                <span className={`text-4xl font-black text-white`}>
                                    {isRecording ? recordingTime : (3 - Math.floor(holdProgress / 33.3))}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                                    {isRecording ? 'Recording Voice' : 'Hold to Trigger'}
                                </h3>
                                <p className="text-red-500 text-[10px] font-black leading-tight mt-1 uppercase tracking-[0.2em]">
                                    {isRecording ? '10 SECONDS CAPTURE...' : 'SOS ACTIVATION'}
                                </p>
                            </div>

                            <Button
                                onClick={cancelSOS}
                                variant="outline"
                                className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-zinc-400 font-bold rounded-2xl h-12 uppercase tracking-widest text-[10px]"
                            >
                                Cancel / Release
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseDown={() => setIsHolding(true)}
                onMouseUp={() => setIsHolding(false)}
                onMouseLeave={() => setIsHolding(false)}
                onTouchStart={() => setIsHolding(true)}
                onTouchEnd={() => setIsHolding(false)}
                disabled={isTriggering || isRecording}
                className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 relative ${isRecording ? 'bg-zinc-900 border-8 border-red-600' : 'bg-red-600 shadow-red-600/40'
                    }`}
            >
                {/* Hold Progress Ring */}
                {isHolding && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            fill="none"
                            stroke="white"
                            strokeWidth="4"
                            strokeDasharray="283"
                            strokeDashoffset={283 - (283 * holdProgress) / 100}
                            className="transition-all duration-100"
                        />
                    </svg>
                )}

                {isTriggering ? (
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                ) : isRecording ? (
                    <div className="flex gap-1 items-end h-8">
                        <motion.div animate={{ height: [8, 24, 8] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-2 bg-red-600 rounded-full" />
                        <motion.div animate={{ height: [12, 32, 12] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }} className="w-2 bg-red-600 rounded-full" />
                        <motion.div animate={{ height: [8, 24, 8] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="w-2 bg-red-600 rounded-full" />
                    </div>
                ) : (
                    <ShieldAlert className="w-10 h-10 md:w-12 md:h-12 text-white" />
                )}
            </motion.button>
        </div>
    );
};
