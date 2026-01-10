
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
// @ts-ignore
import cv from "opencv-wasm";
import { auth } from "@/auth";
import prisma, { withRetry } from "@/lib/prisma";

// Singleton to load OpenCV once
let cvModule: any = null;
async function getCv() {
  if (cvModule) return cvModule;
  cvModule = await cv;
  return cvModule;
}

export async function POST(req: NextRequest) {
  let creditsDeducted = false;
  let userId: string | null = null;

  try {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;

    // Deduct Credit
    const updateResult = await withRetry(() => prisma.user.updateMany({
        where: {
            id: userId!,
            credits: { gt: 0 }
        },
        data: { credits: { decrement: 1 } }
    }));

    if (updateResult.count === 0) {
        return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }
    creditsDeducted = true;

    const { screenshot, style } = await req.json();

    if (!screenshot || !style) {
      throw new Error("Missing screenshot or style");
    }

    const _cv = await getCv();

    // 1. Load Template
    const templatePath = path.join(process.cwd(), "public", "templates", "layouts", `${style}.png`);
    if (!existsSync(templatePath)) {
        throw new Error(`Template '${style}' not found`);
    }
    const templateBuffer = await fs.readFile(templatePath);

    // 2. Load Coordinates
    const layoutPath = path.join(process.cwd(), "coords", "layout.json");
    if (!existsSync(layoutPath)) {
         throw new Error("Layout file missing");
    }
    const layoutData = JSON.parse(await fs.readFile(layoutPath, 'utf-8'));
    const corners = layoutData[style]; // [[x,y], [x,y], [x,y], [x,y]]

    if (!corners) {
        throw new Error("Layout coords not found for this style");
    }

    // 3. Decode Images to Raw Pixels (RGBA)
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

    // 4. Create OpenCV Mats
    const shotMat = new _cv.Mat(shotRaw.info.height, shotRaw.info.width, _cv.CV_8UC4);
    shotMat.data.set(new Uint8Array(shotRaw.data));

    const tempMat = new _cv.Mat(tempRaw.info.height, tempRaw.info.width, _cv.CV_8UC4);
    tempMat.data.set(new Uint8Array(tempRaw.data));

    // 5. Perspective Transform
    const srcCoords = [
        0, 0,
        shotRaw.info.width, 0,
        shotRaw.info.width, shotRaw.info.height,
        0, shotRaw.info.height
    ];
    const dstCoords = corners.flat();

    const srcTri = _cv.matFromArray(4, 1, _cv.CV_32FC2, srcCoords);
    const dstTri = _cv.matFromArray(4, 1, _cv.CV_32FC2, dstCoords);

    const M = _cv.getPerspectiveTransform(srcTri, dstTri);

    // 6. Warp
    const warped = new _cv.Mat();
    const dsize = new _cv.Size(tempRaw.info.width, tempRaw.info.height);
    _cv.warpPerspective(shotMat, warped, M, dsize, _cv.INTER_LINEAR, _cv.BORDER_CONSTANT, new _cv.Scalar(0,0,0,0));

    // 7. Green Screen Masking
    const tempHsv = new _cv.Mat();
    _cv.cvtColor(tempMat, tempHsv, _cv.COLOR_RGBA2RGB); 
    _cv.cvtColor(tempHsv, tempHsv, _cv.COLOR_RGB2HSV);

    const mask = new _cv.Mat();
    const lowScalar = new _cv.Scalar(30, 40, 40);
    const highScalar = new _cv.Scalar(90, 255, 255);
    _cv.inRange(tempHsv, lowScalar, highScalar, mask);

    warped.copyTo(tempMat, mask);

    // 8. Output
    const outData = Buffer.from(tempMat.data); 

    const finalBuffer = await sharp(outData, {
        raw: {
            width: tempRaw.info.width,
            height: tempRaw.info.height,
            channels: 4
        }
    })
    .png()
    .toBuffer();

    // 9. Cleanup
    try {
        shotMat.delete(); tempMat.delete(); 
        srcTri.delete(); dstTri.delete(); M.delete(); 
        warped.delete(); tempHsv.delete(); mask.delete();
    } catch(e) { /* ignore cleanup */ }

    return NextResponse.json({ 
        image: `data:image/png;base64,${finalBuffer.toString('base64')}`, 
        success: true 
    });

  } catch (e: any) {
      console.error("Step 1 Warp Error:", e);
      // Refund Credit
      if (creditsDeducted && userId) {
        await prisma.user.update({
            where: { id: userId },
            data: { credits: { increment: 1 } }
        }).catch(console.error);
      }
      return NextResponse.json({ error: e.message || "Warp failed" }, { status: 500 });
  }
}
