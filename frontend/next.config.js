/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'image.tmdb.org',  // TMDb image domain
    ],
  },
  // Enable strict mode for better development experience
  reactStrictMode: true,
};

module.exports = nextConfig;