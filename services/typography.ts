import sharp from 'sharp';

/**
 * Overlays text onto an image using Sharp and SVG.
 * Replaces the "TEXT HERE" placeholder by rendering a text block over the top area.
 */
export async function addTextOverlay(
    imageBase64: string, 
    headline: string, 
    font: string = 'Sans-serif', 
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
        // Base size is 6% of width. Shrink if headline is long.
        let fontSize = Math.floor(width * 0.06); 
        if (headline.length > 30) fontSize = Math.floor(width * 0.05);
        if (headline.length > 50) fontSize = Math.floor(width * 0.04);

        const safeHeadline = headline.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const safeFont = font.replace(/"/g, "'");

        // Split text into lines
        // We calculate max chars per line based on font size approx.
        // Approx char width is 0.6 * fontSize.
        const maxCharsPerLine = Math.floor(textWidth / (fontSize * 0.6));
        
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

        const lineHeight = fontSize * 1.3;
        // Start text roughly at 8% height, but can adjust based on line count to not go too low
        const startY = Math.floor(height * 0.08) + fontSize;

        const textElements = lines.map((line, i) => 
            `<text x="${width / 2}" y="${startY + (i * lineHeight)}" class="title">${line}</text>`
        ).join('\n');

        // SVG Template
        // Added font stack for Emojis: Segoe UI Emoji (Windows), Apple Color Emoji (Mac), Noto Color Emoji (Linux)
        const svgImage = `
        <svg width="${width}" height="${height}">
            <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                    <feOffset dx="0" dy="2" result="offsetblur" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.5" />
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <style>
                .title { 
                    fill: ${color}; 
                    font-size: ${fontSize}px; 
                    font-family: ${safeFont}, 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif; 
                    font-weight: 800;
                    text-anchor: middle;
                    filter: url(#shadow);
                    letter-spacing: -0.01em;
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
