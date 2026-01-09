import prisma from "@/lib/prisma";

export async function rateLimit(key: string, limit: number, windowSeconds: number) {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + windowSeconds * 1000);

    try {
        const record = await prisma.rateLimit.findUnique({
            where: { key },
        });

        if (record && record.expiresAt > now) {
            if (record.count >= limit) {
                return { success: false, remaining: 0 };
            }
            await prisma.rateLimit.update({
                where: { key },
                data: { count: { increment: 1 } },
            });
            return { success: true, remaining: limit - (record.count + 1) };
        } else {
            // Upsert to handle race conditions best effort
            await prisma.rateLimit.upsert({
                where: { key },
                update: {
                    count: 1,
                    expiresAt: windowEnd,
                },
                create: {
                    key,
                    count: 1,
                    expiresAt: windowEnd,
                },
            });
            return { success: true, remaining: limit - 1 };
        }
    } catch (error) {
        console.error("Rate limit error", error);
        // Fail open if DB is down, to not block users
        return { success: true, remaining: 1 };
    }
}
