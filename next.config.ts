import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "asset2.toothsi.in",
      },
    ],
  },
};

export default nextConfig;
