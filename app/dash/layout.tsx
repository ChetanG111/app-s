import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";
import ClientSessionLoader from "./ClientSessionLoader"; // Import the new client component

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        // If no session on the server, render a client component to handle loading and redirect
        // This component will show a spinner while useSession resolves client-side.
        return <ClientSessionLoader>{children}</ClientSessionLoader>;
    }

    return <>{children}</>;
}
