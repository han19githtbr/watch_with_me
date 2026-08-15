// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // OMDb serves posters from Amazon's media CDN; img.omdbapi.com is kept
    // as a fallback in case a title only exposes a proxied poster URL.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.omdbapi.com',
        pathname: '/**',
      },
    ],
  },
  // NOTE: secrets (MONGODB_URI, JWT_SECRET, OMDB_API_KEY) must never be
  // declared here. Anything placed under `env` in next.config.ts is
  // inlined into the client-side JavaScript bundle at build time, which
  // would leak the database connection string and JWT signing secret to
  // every visitor's browser. Server-only code (API routes, lib/*) reads
  // these directly from process.env at runtime instead — no config needed.
}

export default nextConfig
