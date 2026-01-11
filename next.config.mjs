/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["opencv-wasm", "sharp", "onnxruntime-node"],
  outputFileTracingIncludes: {
    '/api/generate/**/*': ['./node_modules/opencv-wasm/opencv.wasm'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
