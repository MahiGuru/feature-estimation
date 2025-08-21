/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  basePath: isProd ? "/feature-estimation" : "",

  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  assetPrefix: isProd ? "/feature-estimation/" : "",

  webpack: (config, { isServer, dev }) => {
    // Suppress webpack warnings
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /Module not found: Can't resolve/,
      /webpack\.cache\.PackFileCacheStrategy/,
      /Caching failed for pack/,
    ];

    // Disable filesystem cache in development to prevent cache errors
    if (dev) {
      config.cache = {
        type: 'memory',
      };
    }

    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
      };
    }

    return config;
  },

  // Additional configurations for cleaner development
  reactStrictMode: false, // Disable strict mode to reduce development warnings
};

module.exports = nextConfig;
