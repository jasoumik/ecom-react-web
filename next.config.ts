import type { NextConfig } from "next";

// Define a local type compatible with Next.js RemotePattern
type RemotePatternLike = {
  protocol: 'http' | 'https';
  hostname: string;
  port?: string;
  pathname?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const UPLOADS_HOST = process.env.NEXT_PUBLIC_UPLOADS_HOST; // e.g., api.yourdomain.com

// Build remotePatterns with explicit typing to satisfy NextConfig expectations
const remotePatterns: RemotePatternLike[] = [
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
  },
  {
    protocol: 'https',
    hostname: 'picsum.photos',
  },
];

if (UPLOADS_HOST) {
  remotePatterns.push({
    protocol: 'https',
    hostname: UPLOADS_HOST,
    pathname: '/uploads/**',
  });
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui"],
  images: {
    remotePatterns,
  },
  async rewrites() {
    // In development, keep proxy to local API; in production, if API_URL is set and same-origin proxying is desired,
    // you can configure your server to proxy /api to API_URL. Otherwise, front-end should call API_URL directly.
    if (process.env.NODE_ENV !== 'production') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3000/api/:path*',
        },
      ];
    }
    // In production, only set a rewrite if NEXT_PUBLIC_API_URL is provided and you plan to proxy via the hosting web server
    if (API_URL) {
      return [
        {
          source: '/api/:path*',
          destination: `${API_URL}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
