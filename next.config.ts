// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['m.media-amazon.com', 'img.omdbapi.com'],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    OMD_API_KEY: process.env.OMD_API_KEY,
  },
}

export default nextConfig
