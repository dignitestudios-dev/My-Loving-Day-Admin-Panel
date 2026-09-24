import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
