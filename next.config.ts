// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // OMDb serves posters from a handful of different Amazon/IMDb media
    // hosts depending on how old the title's data is, plus its own proxy
    // (img.omdbapi.com). Missing one of these here is the #1 reason a
    // poster silently fails to render — PosterImage still falls back
    // gracefully, but allow-listing all known hosts means far fewer titles
    // need the fallback at all.
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
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ia.media-imdb.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
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
