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
            createdAt: s.createdAt,
            language: (s.settings as any)?.language
        }));
    });
}

// Keep old exports for backward compatibility (they point to new functions)
export const getCachedUserCredits = getUserCredits;
export const getCachedUserScreenshots = getUserScreenshots;

export const LAYOUT_COORDS: Record<string, number[][]> = {
    "Basic": [
        [160.5, 584.98681640625],
        [1116.5, 585.0950317382812],
        [1116.5, 2647.998779296875],
        [160.5, 2647.281494140625]
    ],
    "Rotated-left-facing": [
        [385.3551025390625, 805.095458984375],
        [1073.75244140625, 674.7999877929688],
        [839.3391723632812, 2434.847412109375],
        [125.09297943115234, 2501.469970703125]
    ],
    "Rotated": [
        [221.02796936035156, 725.8388061523438],
        [906.25341796875, 839.8055419921875],
        [1158.424072265625, 2538.73193359375],
        [451.4971008300781, 2473.543212890625]
    ]
};
