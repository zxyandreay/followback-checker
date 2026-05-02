import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/followback-checker",
  assetPrefix: "/followback-checker",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
