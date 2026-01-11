/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["opencv-wasm", "sharp", "onnxruntime-node"],
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
