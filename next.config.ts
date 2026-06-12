import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["cesium"],
  env: {
    CESIUM_BASE_URL: "/cesium"
  }
};

export default nextConfig;
