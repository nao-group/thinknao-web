import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "650pbmmvezmpnfrw.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
