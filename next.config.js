/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "export", // Commented out because API routes are needed
  basePath: isProd ? "/feature-estimation" : "",

  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  assetPrefix: isProd ? "/feature-estimation/" : "",
};

module.exports = nextConfig;
