import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";

export const getCachedUserCredits = (userId: string) => unstable_cache(
    async () => {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true }
        });
        return user?.credits ?? 0;
    },
    [`user-${userId}-credits`], // Unique key per user
    { 
        tags: [`user-${userId}-credits`],
        revalidate: 3600 // Fallback revalidate every hour
    }
)();

export const getCachedUserScreenshots = (userId: string) => unstable_cache(
    async () => {
        const screenshots = await prisma.screenshot.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        return screenshots.map(s => ({
            name: s.url.split('/').pop() || s.id,
            url: s.url,
            createdAt: s.createdAt
        }));
    },
    [`user-${userId}-screenshots`], // Unique key per user
    { 
        tags: [`user-${userId}-screenshots`],
        revalidate: 3600 
    }
)();