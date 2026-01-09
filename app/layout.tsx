import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "shots88",
    description: "Professional, high-quality app store mockups for your next big release",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} antialiased bg-[#050505] text-white`}>
                <SessionProvider>
                    <div className="grid-container" />
                    {children}
                </SessionProvider>
            </body>
        </html>
    );
}
