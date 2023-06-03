/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rhomadoni.com",
        port: "",
        pathname: "/wp-content/**",
      },
      {
        protocol: "https",
        hostname: "rhomadoni.com",
        port: "",
        pathname: "/images/**",
      },
    ],
  },
  experimental: {
    esmExternals: false,
  }
};

module.exports = nextConfig;
