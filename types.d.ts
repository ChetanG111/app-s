
/// <reference types="next-auth" />
/// <reference types="next-auth/jwt" />

// This type augmentation is necessary for NextAuth.js to correctly
// infer types for `session.user` and to add the `auth` property to `NextRequest`
// when using the NextAuth.js middleware.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      credits: number; // Add custom field
    } & DefaultSession["user"];
  }
  interface User {
    credits: number; // Add custom field
  }
}

declare module "next" {
  interface NextRequest {
    auth: import("next-auth").Session | null;
  }
}


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

