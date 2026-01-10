import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
// @ts-expect-error - opencv-wasm has no types
import cv from "opencv-wasm";
import { auth } from "@/auth";
import prisma, { withRetry } from "@/lib/prisma";
import { signToken } from "@/lib/security";
import { rateLimit } from "@/lib/ratelimit";

// Singleton to load OpenCV once
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cvModule: any = null;
async function getCv() {
  if (cvModule) return cvModule;
  cvModule = await cv;
  return cvModule;
}

export async function POST(req: NextRequest) {
  let transactionId: string | null = null;

  try {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

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
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user || user.credits < 1) {
                throw new Error("Insufficient credits");
            }
            
            await tx.user.update({
                where: { id: userId },
                data: { credits: { decrement: 1 } }
            });

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
    } catch (error: any) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return NextResponse.json({ error: (error as any).message || "Payment failed" }, { status: 402 });
    }

    const _cv = await getCv();

    // 4. Load Template
    const templatePath = path.join(process.cwd(), "public", "templates", "layouts", `${style}.png`);
    if (!existsSync(templatePath)) {
        throw new Error(`Template '${style}' not found`);
    }
    const templateBuffer = await fs.readFile(templatePath);

    // 5. Load Coordinates
    const layoutPath = path.join(process.cwd(), "coords", "layout.json");
    if (!existsSync(layoutPath)) {
         throw new Error("Layout file missing");
    }
    const layoutData = JSON.parse(await fs.readFile(layoutPath, 'utf-8'));
    const corners = layoutData[style]; 

    if (!corners) {
        throw new Error("Layout coords not found for this style");
    }

    // 6. Image Processing (with Leak Protection)
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

    let shotMat, tempMat, srcTri, dstTri, M, warped, tempHsv, mask;
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

        warped = new _cv.Mat();
        const dsize = new _cv.Size(tempRaw.info.width, tempRaw.info.height);
        _cv.warpPerspective(shotMat, warped, M, dsize, _cv.INTER_LINEAR, _cv.BORDER_CONSTANT, new _cv.Scalar(0,0,0,0));

        tempHsv = new _cv.Mat();
        _cv.cvtColor(tempMat, tempHsv, _cv.COLOR_RGBA2RGB); 
        _cv.cvtColor(tempHsv, tempHsv, _cv.COLOR_RGB2HSV);

        mask = new _cv.Mat();
        const lowScalar = new _cv.Scalar(30, 40, 40);
        const highScalar = new _cv.Scalar(90, 255, 255);
        _cv.inRange(tempHsv, lowScalar, highScalar, mask);

        warped.copyTo(tempMat, mask);

        const outData = Buffer.from(tempMat.data); 
        finalBuffer = await sharp(outData, {
            raw: {
                width: tempRaw.info.width,
                height: tempRaw.info.height,
                channels: 4
            }
        })
        .png()
        .toBuffer();

    } finally {
        // Safe Cleanup
        if (shotMat && !shotMat.isDeleted()) shotMat.delete();
        if (tempMat && !tempMat.isDeleted()) tempMat.delete();
        if (srcTri && !srcTri.isDeleted()) srcTri.delete();
        if (dstTri && !dstTri.isDeleted()) dstTri.delete();
        if (M && !M.isDeleted()) M.delete();
        if (warped && !warped.isDeleted()) warped.delete();
        if (tempHsv && !tempHsv.isDeleted()) tempHsv.delete();
        if (mask && !mask.isDeleted()) mask.delete();
    }

    // GENERATE TOKEN (Include transactionId)
    const token = await signToken({ userId, step: 1, transactionId });

    return NextResponse.json({ 
        image: `data:image/png;base64,${finalBuffer.toString('base64')}`, 
        token,
        success: true 
    });

  } catch (error: unknown) {
      console.error("Step 1 Warp Error:", error);
      const message = error instanceof Error ? error.message : "Warp failed";
      return NextResponse.json({ error: message }, { status: 500 });
  }
}