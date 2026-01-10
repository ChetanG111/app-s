import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Load fonts into memory (Base64) to embed in SVG
const loadFont = (filename: string) => {
    try {
        const fontPath = path.join(process.cwd(), 'public', 'fonts', filename);
        if (fs.existsSync(fontPath)) {
            return fs.readFileSync(fontPath).toString('base64');
        }
    } catch (e) {
        console.error("Error loading font:", filename, e);
    }
    return null;
};

const FONTS = {
    'Inter': loadFont('Inter-Bold.ttf'),
    'Caveat': loadFont('Caveat-Bold.ttf'),
    'Poppins': loadFont('Poppins-Bold.ttf')
};

// Map font IDs to font-family names used in CSS
const FONT_MAP: Record<string, string> = {
    'standard': 'Inter',
    'handwritten': 'Caveat',
    'modern': 'Poppins',
};

/**
 * Overlays text onto an image using Sharp and SVG.
 * Replaces the "TEXT HERE" placeholder by rendering a text block over the top area.
 */
export async function addTextOverlay(
    imageBase64: string,
    headline: string,
    font: string = 'standard',
    color: string = 'white'
): Promise<string> {
    try {
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        const metadata = await sharp(imageBuffer).metadata();
        const width = metadata.width || 1080;
        const height = metadata.height || 1920;

        // Configuration
        const textWidth = Math.floor(width * 0.85); // Slightly wider
        const textX = Math.floor((width - textWidth) / 2);

        // Dynamic Font Size Logic
        // Base size is 10% of width (large like template). Shrink progressively for longer text.
        let fontSize = Math.floor(width * 0.10);
        if (headline.length > 15) fontSize = Math.floor(width * 0.08);
        if (headline.length > 25) fontSize = Math.floor(width * 0.065);
        if (headline.length > 40) fontSize = Math.floor(width * 0.055);
        if (headline.length > 60) fontSize = Math.floor(width * 0.045);

        const safeHeadline = headline.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Get generic font family name or default to Inter
        const fontFamilyName = FONT_MAP[font] || 'Inter';
        // Get the actual Base64 data if available
        const fontData = FONTS[fontFamilyName as keyof typeof FONTS] || FONTS['Inter'];

        // Construct @font-face CSS
        let fontFaceCss = '';
        if (fontData) {
            fontFaceCss = `
                @font-face {
                    font-family: '${fontFamilyName}';
                    src: url(data:font/ttf;base64,${fontData}) format('truetype');
                    font-weight: bold;
                    font-style: normal;
                }
            `;
        } else {
            console.warn(`Font data missing for ${fontFamilyName}, falling back to system fonts.`);
        }

        // Split text into lines
        // We calculate max chars per line based on font size approx.
        // Approx char width is 0.5 * fontSize for these variable fonts.
        const maxCharsPerLine = Math.floor(textWidth / (fontSize * 0.5));

        const words = safeHeadline.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        words.forEach(word => {
            if ((currentLine + word).length > maxCharsPerLine) {
                lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine += word + ' ';
            }
        });
        lines.push(currentLine.trim());

        const lineHeight = fontSize * 1.2;
        // Start text roughly at 8% height
        const startY = Math.floor(height * 0.08) + fontSize;

        const textElements = lines.map((line, i) =>
            `<text x="${width / 2}" y="${startY + (i * lineHeight)}" class="title">${line}</text>`
        ).join('\n');

        // SVG Template
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
            <style>
                ${fontFaceCss}
                .title { 
                    fill: ${color}; 
                    font-size: ${fontSize}px; 
                    font-family: '${fontFamilyName}', 'Segoe UI', sans-serif; 
                    font-weight: bold;
                    text-anchor: middle;
                    filter: url(#shadow);
                    letter-spacing: -0.02em;
                }
            </style>
            ${textElements}
        </svg>
        `;

        // Composite the SVG onto the original image
        const outputBuffer = await sharp(imageBuffer)
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
        // Fallback: Return original image if text fails
        return imageBase64;
    }
}
