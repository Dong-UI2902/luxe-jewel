import { imageHosts } from './image-hosts.config.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  distDir: process.env.DIST_DIR || '.next',

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: imageHosts,
    // unoptimized: process.env.NODE_ENV !== 'production',
    // deviceSizes: [640, 1080, 1920],
    // imageSizes: [16, 64, 256],
    loader: 'custom',
    loaderFile: './supabaseLoader.js',
  },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/homepage',
        permanent: false,
      },
    ];
  },
};
export default nextConfig;
