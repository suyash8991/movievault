import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'image.tmdb.org',  // TMDb image domain
    ],
  },
  // Enable strict mode for better development experience
  reactStrictMode: true,
};

export default nextConfig;
