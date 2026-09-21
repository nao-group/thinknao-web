import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve image files directly. The optimizer intermittently returns broken
    // images when this project runs from the external drive on macOS.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "650pbmmvezmpnfrw.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
