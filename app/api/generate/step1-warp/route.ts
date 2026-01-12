
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import crypto from "crypto";
// @ts-ignore
import { cv } from "opencv-wasm";
import { auth } from "@/auth";
import prisma, { withRetry } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { signToken } from "@/lib/security";
import { rateLimit } from "@/lib/ratelimit";
import { LAYOUT_COORDS } from "@/lib/data";

// OpenCV is synchronously loaded, just return it directly
function getCv() {
    return cv;
}

export async function POST(req: NextRequest) {
    let transactionId: string | null = null;
    let userId: string | null = null;

    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        userId = session.user.id;

        // 1. Rate Limit
        const { success } = await rateLimit(`generate:${userId}`, 10, 60);
        if (!success) {
            return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
        }

        const { screenshot, style } = await req.json();

        // 2. Validate Inputs (Path Traversal Protection)
        const VALID_STYLES = ['Basic', 'Rotated', 'Rotated-left-facing'];
        if (!screenshot || !style || !VALID_STYLES.includes(style)) {
            return NextResponse.json({ error: "Invalid style or missing screenshot" }, { status: 400 });
        }

        // 3. Create Pending Transaction & Deduct Credit
        try {
            const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                if (!userId) throw new Error("Unauthorized");
                const user = await tx.user.findUnique({ where: { id: userId } });
                if (!user || user.credits < 1) {
                    throw new Error("Insufficient credits");
                }

                await tx.user.update({
                    where: { id: userId },
                    data: { credits: { decrement: 1 } }
                });

                // Assuming CreditTransaction model exists based on the file I read
                // If it doesn't exist in schema, this will fail.
                // But since I read it from the file, it must exist?
                // Wait, I read the file content, so the CODE was there.
                // I'll stick to what was there.
                return await tx.creditTransaction.create({
                    data: {
                        userId,
                        amount: -1,
                        type: "GENERATION",
                        status: "PENDING",
                        metadata: { style }
                    }
                });
            });
            transactionId = result.id;
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = (error as any).message || "Payment failed";
            return NextResponse.json({ error: message }, { status: 402 });
        }

        const _cv = getCv();

        // 4. Load Template
        const templatePath = path.join(process.cwd(), "public", "layouts", `${style}.png`);
        if (!existsSync(templatePath)) {
            throw new Error(`Template '${style}' not found`);
        }
        const templateBuffer = await fs.readFile(templatePath);

        // 5. Load Coordinates
        const corners = LAYOUT_COORDS[style];

        if (!corners) {
            throw new Error("Layout coords not found for this style");
        }

        // 6. Image Processing
        const screenshotBuffer = Buffer.from(screenshot.split(",")[1], 'base64');
        const shotRaw = await sharp(screenshotBuffer)
            .ensureAlpha()
            .resize(1200)
            .toFormat('raw')
            .toBuffer({ resolveWithObject: true });

        const tempRaw = await sharp(templateBuffer)
            .ensureAlpha()
            .toFormat('raw')
            .toBuffer({ resolveWithObject: true });

        let shotMat: any = null;
        let tempMat: any = null;
        let srcTri: any = null;
        let dstTri: any = null;
        let M: any = null;
        let warped: any = null;
        let tempHsv: any = null;
        let mask: any = null;
        let cleanedMask: any = null;
        let dilatedMask: any = null;
        let kernel: any = null;
        let blurredMask: any = null;
        let channels: any = null;
        let newChannels: any = null;
        let finalBuffer;

        try {
            shotMat = new _cv.Mat(shotRaw.info.height, shotRaw.info.width, _cv.CV_8UC4);
            shotMat.data.set(new Uint8Array(shotRaw.data));

            tempMat = new _cv.Mat(tempRaw.info.height, tempRaw.info.width, _cv.CV_8UC4);
            tempMat.data.set(new Uint8Array(tempRaw.data));

            const srcCoords = [
                0, 0,
                shotRaw.info.width, 0,
                shotRaw.info.width, shotRaw.info.height,
                0, shotRaw.info.height
            ];
            const dstCoords = corners.flat();

            srcTri = _cv.matFromArray(4, 1, _cv.CV_32FC2, srcCoords);
            dstTri = _cv.matFromArray(4, 1, _cv.CV_32FC2, dstCoords);

            M = _cv.getPerspectiveTransform(srcTri, dstTri);

            // 2. Warp Screenshot (Color)
            // Use INTER_CUBIC for high quality
            // Use BORDER_REPLICATE to fill edges with image color, preventing dark halos when blended
            warped = new _cv.Mat();
            const dsize = new _cv.Size(tempRaw.info.width, tempRaw.info.height);
            _cv.warpPerspective(shotMat, warped, M, dsize, _cv.INTER_CUBIC, _cv.BORDER_REPLICATE, new _cv.Scalar(0, 0, 0, 0));

            // 3. Generate Soft Mask from Green Screen (The Constraint)

            tempHsv = new _cv.Mat();
            _cv.cvtColor(tempMat, tempHsv, _cv.COLOR_RGBA2RGB);
            _cv.cvtColor(tempHsv, tempHsv, _cv.COLOR_RGB2HSV);

            mask = new _cv.Mat();
            // Tighten HSV range to avoid bezel reflections (Green is ~60)
            const lowMat = _cv.matFromArray(1, 3, _cv.CV_8UC1, [35, 50, 50]);
            const highMat = _cv.matFromArray(1, 3, _cv.CV_8UC1, [85, 255, 255]);
            _cv.inRange(tempHsv, lowMat, highMat, mask);
            lowMat.delete();
            highMat.delete();

            // 4. Clean & Refine Mask
            // Remove noise (white spots)
            cleanedMask = new _cv.Mat();
            _cv.medianBlur(mask, cleanedMask, 5);

            // 5. Create "Black Hole" on Template (Remove Green Fringe)
            // We dilate the mask to ensure we cover ALL green pixels, including the anti-aliased edge.
            // Then we paint this area BLACK on the template.
            dilatedMask = new _cv.Mat();
            kernel = _cv.Mat.ones(3, 3, _cv.CV_8U);
            _cv.dilate(cleanedMask, dilatedMask, kernel, new _cv.Point(-1, -1), 2);

            // Set the screen area to pure Black (0,0,0,255)
            // This kills the green halo. Any edge transparency in the overlay will now blend with Black.
            tempMat.setTo(new _cv.Scalar(0, 0, 0, 255), dilatedMask);

            // 6. Blur Mask (Anti-aliasing for Overlay)
            // We use the ORIGINAL cleaned mask (not dilated) for the image.
            // This creates a "Fade to Black" effect at the edge, mimicking a bezel gap.
            blurredMask = new _cv.Mat();
            const ksize = new _cv.Size(5, 5);
            _cv.GaussianBlur(cleanedMask, blurredMask, ksize, 0, 0, _cv.BORDER_DEFAULT);

            // 7. Merge for Overlay
            channels = new _cv.MatVector();
            _cv.split(warped, channels);

            newChannels = new _cv.MatVector();
            newChannels.push_back(channels.get(0)); // R
            newChannels.push_back(channels.get(1)); // G
            newChannels.push_back(channels.get(2)); // B
            newChannels.push_back(blurredMask);     // A

            _cv.merge(newChannels, warped);

            // 8. Prepare Buffers for Sharp
            // We must use the modified tempMat (with black hole) as the base
            const baseTemplateBuffer = Buffer.from(tempMat.data);
            const overlayBuffer = Buffer.from(warped.data);

            // 9. Composite using Sharp
            // Note: We use the modified template buffer as the base
            finalBuffer = await sharp(baseTemplateBuffer, {
                raw: {
                    width: tempRaw.info.width,
                    height: tempRaw.info.height,
                    channels: 4
                }
            })
                .composite([{
                    input: overlayBuffer,
                    raw: {
                        width: tempRaw.info.width,
                        height: tempRaw.info.height,
                        channels: 4
                    }
                }])
                .png()
                .toBuffer();

        } finally {
            if (shotMat && !shotMat.isDeleted()) shotMat.delete();
            if (tempMat && !tempMat.isDeleted()) tempMat.delete();
            if (srcTri && !srcTri.isDeleted()) srcTri.delete();
            if (dstTri && !dstTri.isDeleted()) dstTri.delete();
            if (M && !M.isDeleted()) M.delete();
            if (warped && !warped.isDeleted()) warped.delete();
            if (tempHsv && !tempHsv.isDeleted()) tempHsv.delete();
            if (mask && !mask.isDeleted()) mask.delete();
            if (cleanedMask && !cleanedMask.isDeleted()) cleanedMask.delete();
            if (dilatedMask && !dilatedMask.isDeleted()) dilatedMask.delete();
            if (kernel && !kernel.isDeleted()) kernel.delete();
            if (blurredMask && !blurredMask.isDeleted()) blurredMask.delete();
            if (channels && !channels.isDeleted()) channels.delete();
            if (newChannels && !newChannels.isDeleted()) newChannels.delete();
        }

        // GENERATE TOKEN
        // Include transactionId AND imageHash
        const finalBase64 = `data:image/png;base64,${finalBuffer.toString('base64')}`;
        const imageHash = crypto.createHash('sha256').update(finalBase64).digest('hex');

        const token = await signToken({ userId, step: 1, transactionId, imageHash });

        return NextResponse.json({
            image: finalBase64,
            token,
            success: true
        });

    } catch (error: unknown) {
        console.error("Step 1 Warp Error:", error);
        const message = error instanceof Error ? error.message : "Warp failed";

        if (userId && transactionId) {
            const uid = userId;
            const tid = transactionId;
            // Use withRetry to ensure credits are not lost if DB is briefly unavailable
            await withRetry(() => prisma.$transaction([
                prisma.user.update({
                    where: { id: uid },
                    data: { credits: { increment: 1 } }
                }),
                prisma.creditTransaction.updateMany({
                    where: { id: tid, userId: uid },
                    data: { status: "FAILED" }
                })
            ])).catch(e => console.error("CRITICAL: Credit refund failed", e));
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
