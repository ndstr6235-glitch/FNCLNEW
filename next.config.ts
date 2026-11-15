import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["imapflow", "mailparser", "pdf-lib", "@pdf-lib/fontkit"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
