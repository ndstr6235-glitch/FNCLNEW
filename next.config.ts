import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["imapflow", "mailparser"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
