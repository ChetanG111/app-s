import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import TextToSVG from 'text-to-svg';

// Cache TextToSVG instances
const fontCache: Record<string, TextToSVG | null> = {
    'Inter': null,
    'Caveat': null,
    'Poppins': null
};

// Helper to load or get cached font
const getFont = (family: string): TextToSVG | null => {
    if (fontCache[family]) return fontCache[family];

    try {
        const fontFile = `${family}-Bold.ttf`;
        const fontPath = path.join(process.cwd(), 'public', 'fonts', fontFile);

        if (fs.existsSync(fontPath)) {
            console.log(`[Typography] Loading font: ${fontPath}`);
            const t = TextToSVG.loadSync(fontPath);
            fontCache[family] = t;
            return t;
        } else {
            console.error(`[Typography] Font file missing: ${fontPath}`);
        }
    } catch (e) {
        console.error(`[Typography] Error loading font ${family}:`, e);
    }
    return null;
};

// Map font IDs to internal family names
const FONT_MAP: Record<string, string> = {
    'standard': 'Inter',
    'handwritten': 'Caveat',
    'modern': 'Poppins',
};

/**
 * Overlays text onto an image using Sharp and SVG paths.
 * Converting text to SVG paths (curves) avoids mismatched font rendering in different environments.
 */
export async function addTextOverlay(
    imageBase64: string,
    headline: string,
    font: string = 'standard',
    color: string = 'white'
): Promise<string> {
    try {
        const imageBuffer = Buffer.from(imageBase64, 'base64');

        // FORCE RESIZE to iPhone 16 Pro Max (6.9") - Apple's 2025 Flagship Size
        // Apple requires 1320 x 2868. This is the "largest device" that scales down to all others.
        // We resize BEFORE adding text so the text is rendered natively at this high resolution.
        const resizedBuffer = await sharp(imageBuffer)
            .resize(1320, 2868, {
                fit: 'fill', // Ignore slight aspect ratio differences (0.2%) to fill screen
                kernel: sharp.kernel.lanczos3 // High-quality upscaling
            })
            .toBuffer();

        const metadata = await sharp(resizedBuffer).metadata();
        const width = metadata.width || 1320;
        const height = metadata.height || 2868;

        // 1. Determine Font
        const fontFamily = FONT_MAP[font] || 'Inter';
        let textToSVG = getFont(fontFamily);

        // Fallback to Inter if requested font fails
        if (!textToSVG && fontFamily !== 'Inter') {
            console.warn(`[Typography] Fallback to Inter for ${fontFamily}`);
            textToSVG = getFont('Inter');
        }

        if (!textToSVG) {
            console.error("[Typography] Critical: No fonts available.");
            return imageBase64;
        }

        // 2. Sizing Logic
        // Base size is 10% of width
        let fontSize = Math.floor(width * 0.10);
        if (headline.length > 15) fontSize = Math.floor(width * 0.08);
        if (headline.length > 25) fontSize = Math.floor(width * 0.065);
        if (headline.length > 40) fontSize = Math.floor(width * 0.055);
        if (headline.length > 60) fontSize = Math.floor(width * 0.045);

        // 3. Wrapping Logic
        const textWidth = Math.floor(width * 0.85);
        // Estimate max chars per line. 
        // We use a conservative estimate: 0.5 * fontSize average char width 
        const maxCharsPerLine = Math.floor(textWidth / (fontSize * 0.5));

        const words = headline.trim().split(/\s+/);
        const lines: string[] = [];
        let currentLine = '';

        words.forEach(word => {
            // Check potential length
            if ((currentLine + word).length > maxCharsPerLine) {
                if (currentLine) lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine += word + ' ';
            }
        });
        if (currentLine) lines.push(currentLine.trim());

        // 4. Generate SVG Paths
        const lineHeight = fontSize * 1.2;
        const totalTextHeight = lines.length * lineHeight;
        const startY = Math.floor(height * 0.08) + fontSize; // First baseline

        const pathElements = lines.map((line, i) => {
            const y = startY + (i * lineHeight);

            // Get path data 'd' attribute
            // anchor: 'top' means x,y is top-left usually, 'center' helps with alignment
            // However, text-to-svg anchor options are: 'center middle', 'top', 'bottom', etc.
            // Using 'center' horizontally requires correct x.

            // We want text centered at width/2.
            const options = {
                x: width / 2,
                y: y,
                fontSize: fontSize,
                anchor: 'center middle', // align center to x, middle to y (approx baseline)
                attributes: {
                    fill: color
                }
            };

            // Note: getPath methods in text-to-svg return <path d="..." /> string
            return textToSVG?.getPath(line, options);
        }).join('\n');

        // 5. Build SVG
        // We add a drop shadow filter for better visibility
        const svgImage = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                    <feOffset dx="0" dy="4" result="offsetblur" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.7" />
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <g filter="url(#shadow)">
                ${pathElements}
            </g>
        </svg>
        `;

        // 6. Composite
        const outputBuffer = await sharp(resizedBuffer)
            .composite([
                {
                    input: Buffer.from(svgImage),
                    top: 0,
                    left: 0,
                },
            ])
            .png()
            .toBuffer();

        return outputBuffer.toString('base64');
    } catch (error) {
        console.error("Typography Error:", error);
        return imageBase64;
    }
}
