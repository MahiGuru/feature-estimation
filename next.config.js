/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  basePath: '',
  trailingSlash: false,
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  assetPrefix: '',

  webpack: (config, { isServer, dev }) => {
    // Enhanced tree-shaking optimization (only in production)
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }

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
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
};

module.exports = nextConfig;
