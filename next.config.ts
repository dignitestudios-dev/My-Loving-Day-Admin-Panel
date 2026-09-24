import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/dashboard/music-resources",
        destination: "/dashboard/music-resource",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
