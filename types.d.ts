
declare module 'text-to-svg' {
    export interface TextToSVGOptions {
        x?: number;
        y?: number;
        fontSize?: number;
        anchor?: string;
        attributes?: Record<string, string>;
    }

    export interface TextToSVGMetrics {
        x: number;
        y: number;
        baseline: number;
        width: number;
        height: number;
        ascender: number;
        descender: number;
    }

    class TextToSVG {
        static loadSync(file: string): TextToSVG;
        getPath(text: string, options?: TextToSVGOptions): string;
        getMetrics(text: string, options?: TextToSVGOptions): TextToSVGMetrics;
        getSVG(text: string, options?: TextToSVGOptions): string;
    }

    export default TextToSVG;
}
