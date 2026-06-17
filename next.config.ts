import type { NextConfig } from "next";

const gisServiceBaseUrl =
  process.env.GIS_SERVICE_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["cesium"],
  env: {
    CESIUM_BASE_URL: "/cesium/"
  },
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify("/cesium/")
      })
    );

    return config;
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${gisServiceBaseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
