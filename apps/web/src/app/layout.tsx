import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
    weight: ["300", "400", "500", "600", "700", "800"],
    display: 'swap',
});

export const metadata: Metadata = {
    title: "DeshiTrip | Explore Bangladesh",
    description: "Your ultimate travel companion for discovering the beauty of Bangladesh.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body
                className={`${outfit.variable} antialiased selection:bg-emerald-500 selection:text-white bg-[#0a0f0d]`}
            >
                {children}
            </body>
        </html>
    );
}
