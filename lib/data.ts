import prisma, { withRetry } from "@/lib/prisma";

/**
 * Get user credits directly from database.
 * Using direct queries instead of unstable_cache for reliability.
 */
export async function getUserCredits(userId: string): Promise<number> {
    return withRetry(async () => {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true }
        });
        return user?.credits ?? 0;
    });
}

/**
 * Get user screenshots directly from database.
 * Using direct queries instead of unstable_cache for reliability.
 */
export async function getUserScreenshots(userId: string) {
    return withRetry(async () => {
        const screenshots = await prisma.screenshot.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        return screenshots.map(s => ({
            name: s.url.split('/').pop() || s.id,
            url: s.url,
            createdAt: s.createdAt
        }));
    });
}

// Keep old exports for backward compatibility (they point to new functions)
export const getCachedUserCredits = getUserCredits;
export const getCachedUserScreenshots = getUserScreenshots;