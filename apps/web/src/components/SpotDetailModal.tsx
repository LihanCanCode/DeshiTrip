import { Modal } from "./ui/Modal";
import { Spot } from "@/data/spotsData";
import { Bus, Camera, DollarSign, Hotel, MapPin } from "lucide-react";

interface SpotDetailModalProps {
    spot: Spot | null;
    isOpen: boolean;
    onClose: () => void;
}

export const SpotDetailModal = ({ spot, isOpen, onClose }: SpotDetailModalProps) => {
    if (!spot || !spot.tourPlan) return null;

    const { tourPlan } = spot;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Plan for ${spot.name.en}`}>
            <div className="space-y-8">
                {/* Description */}
                {spot.description && (
                    <p className="text-zinc-400 italic border-l-2 border-emerald-500 pl-4">
                        {spot.description}
                    </p>
                )}

                {/* Transport Section */}
                <div>
                    <h4 className="flex items-center gap-2 text-lg font-bold text-emerald-400 mb-4">
                        <Bus className="w-5 h-5" />
                        How to Go
                    </h4>
                    <div className="grid gap-3">
                        {tourPlan.transport.map((option, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-white">{option.method}</span>
                                    <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded-lg font-bold">
                                        {option.cost}
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-400">{option.details}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sightseeing Section */}
                <div>
                    <h4 className="flex items-center gap-2 text-lg font-bold text-amber-400 mb-4">
                        <Camera className="w-5 h-5" />
                        Top Sightseeing
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {tourPlan.sightseeing.map((place, idx) => (
                            <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
                                <MapPin className="w-3.5 h-3.5" />
                                {place}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Hotels Section */}
                <div>
                    <h4 className="flex items-center gap-2 text-lg font-bold text-blue-400 mb-2">
                        <Hotel className="w-5 h-5" />
                        Accommodation
                    </h4>
                    <ul className="list-disc list-inside text-zinc-400 text-sm space-y-1 ml-1">
                        {tourPlan.hotels.map((hotel, idx) => (
                            <li key={idx}>{hotel}</li>
                        ))}
                    </ul>
                </div>

                {/* Budget Section */}
                <div className="p-5 rounded-3xl bg-emerald-900/20 border border-emerald-500/30">
                    <h4 className="flex items-center gap-2 text-lg font-bold text-emerald-400 mb-2">
                        <DollarSign className="w-5 h-5" />
                        Estimated Budget
                    </h4>
                    <p className="text-2xl font-black text-white">{tourPlan.totalEstimatedCost}</p>
                    <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">Includes Transport, Hotel & Food</p>
                </div>
            </div>
        </Modal>
    );
};
