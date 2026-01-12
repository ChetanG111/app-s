import type { Metadata } from "next/types";
import { Inter, Caveat, Poppins } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const caveat = Caveat({ subsets: ["latin"], variable: '--font-caveat' });
const poppins = Poppins({ weight: ['400', '600', '700'], subsets: ["latin"], variable: '--font-poppins' });

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
            <body className={`${inter.variable} ${caveat.variable} ${poppins.variable} font-sans antialiased bg-[#050505] text-white`}>
                <SessionProvider
                    refetchInterval={5 * 60} // Revalidate session every 5 minutes
                    refetchOnWindowFocus={false} // Don't block on window focus
                >
                    <div className="grid-container" />
                    {children}
                    <Analytics />
                </SessionProvider>
            </body>
        </html>
    );
}
