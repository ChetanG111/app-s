"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClientSessionLoader({
    children,
}: {
    children: React.ReactNode;
}) {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login?callbackUrl=/dash");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="flex w-screen h-screen bg-[#050505] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <p className="text-zinc-500 text-sm font-medium">Loading session...</p>
                </div>
            </div>
        );
    }

    // If status is "authenticated", render children (this should not happen if layout already passed session)
    // If status is "unauthenticated", useEffect above will handle redirect
    return <>{children}</>;
}
