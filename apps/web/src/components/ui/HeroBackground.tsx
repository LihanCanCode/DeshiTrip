"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent, useEffect } from "react";
import Image from "next/image";

export function HeroBackground() {
    let mouseX = useMotionValue(0);
    let mouseY = useMotionValue(0);

    useEffect(() => {
        function handleMouseMove({ clientX, clientY }: globalThis.MouseEvent) {
            mouseX.set(clientX);
            mouseY.set(clientY);
        }

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/spots/tanguar.jpg"
                    alt="Sajek Valley"
                    fill
                    className="object-cover opacity-80"
                    priority
                    style={{ objectPosition: '20% 40%' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f0d] via-[#0a0f0d]/80 to-[#0a0f0d]" />
            </div>

            {/* Spotlight Effect */}
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-100 transition duration-300"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            1200px circle at ${mouseX}px ${mouseY}px,
                            rgba(16, 185, 129, 0.15),
                            transparent 80%
                        )
                    `,
                }}
            />
        </div>
    );
}
