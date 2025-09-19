/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for static export (SSG only) - perfect for Cloudflare Pages
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
